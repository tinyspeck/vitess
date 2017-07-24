/*
Copyright 2017 Google Inc.

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/

// Package vtexplain analyzes a set of sql statements and returns the
// corresponding vtgate and vttablet query plans that will be executed
// on the given statements
package vtexplain

// XXX TODO:
//
// 1. Add full grammar support for CREATE TABLE
// 2. Parse schema to set up the fakesqldb information schema results
// 3. For DML queries handle comments to indicate whether rows exist or not
// 4. Human-friendly and json output modes
// 5. Options for RBR/SBR, 2PC transactions, autocommit, etc

import (
	"encoding/json"
	"fmt"
	"strings"

	log "github.com/golang/glog"
	"golang.org/x/net/context"

	"github.com/youtube/vitess/go/vt/discovery"
	"github.com/youtube/vitess/go/vt/key"
	"github.com/youtube/vitess/go/vt/sqlparser"
	"github.com/youtube/vitess/go/vt/topo"
	"github.com/youtube/vitess/go/vt/vtgate"
	"github.com/youtube/vitess/go/vt/vtgate/engine"
	"github.com/youtube/vitess/go/vt/vtgate/gateway"
	"github.com/youtube/vitess/go/vt/vttablet/sandboxconn"

	querypb "github.com/youtube/vitess/go/vt/proto/query"
	topodatapb "github.com/youtube/vitess/go/vt/proto/topodata"
	vschemapb "github.com/youtube/vitess/go/vt/proto/vschema"
	vtgatepb "github.com/youtube/vitess/go/vt/proto/vtgate"
)

type TabletQuery struct {
	// Sql command sent to the given tablet
	Sql string

	// BindVars sent with the command
	BindVars map[string]interface{}

	// The actual queries executed by mysql
	MysqlQueries []string
}

type Plan struct {
	// original sql statement
	Sql string

	// the vtgate plan(s)
	Plans []*engine.Plan

	// list of queries / bind vars sent to each tablet
	TabletQueries map[string][]TabletQuery
}

var (
	explainTopo     *vtExplainTopo
	vtgateExecutor  *vtgate.Executor
	fakeHealthCheck *discovery.FakeHealthCheck
)

var executeOptions = &querypb.ExecuteOptions{
	IncludedFields: querypb.ExecuteOptions_TYPE_ONLY,
}

var masterSession = &vtgatepb.Session{
	TargetString: "@master",
}

const (
	CELL = "explainCell"

	// currently we only use two shards -- maybe make this parameterizable?
	NUM_SHARDS = 2
)

func BuildTopo(vschemaStr string) error {
	explainTopo.Lock.Lock()
	defer explainTopo.Lock.Unlock()

	explainTopo.Keyspaces = make(map[string]*vschemapb.Keyspace)
	err := json.Unmarshal([]byte(vschemaStr), &explainTopo.Keyspaces)
	if err != nil {
		return err
	}

	explainTopo.TabletConns = make(map[string]*sandboxconn.SandboxConn)
	for ks, vschema := range explainTopo.Keyspaces {
		num_shards := 1
		if vschema.Sharded {
			num_shards = NUM_SHARDS
		}
		for i := 0; i < num_shards; i++ {
			kr, err := key.EvenShardsKeyRange(i, num_shards)
			if err != nil {
				return err
			}
			shard := key.KeyRangeString(kr)
			hostname := fmt.Sprintf("%s/%s", ks, shard)
			log.Infof("registering test tablet %s for keyspace %s shard %s", hostname, ks, shard)
			sc := fakeHealthCheck.AddTestTablet(CELL, hostname, 1, ks, shard, topodatapb.TabletType_MASTER, true, 1, nil)
			explainTopo.TabletConns[hostname] = sc
		}
	}

	return err
}

func newFakeResolver(hc discovery.HealthCheck, serv topo.SrvTopoServer, cell string) *vtgate.Resolver {
	gw := gateway.GetCreator()(hc, topo.Server{}, serv, cell, 3)
	gw.WaitForTablets(context.Background(), []topodatapb.TabletType{topodatapb.TabletType_REPLICA})
	tc := vtgate.NewTxConn(gw, vtgatepb.TransactionMode_MULTI)
	sc := vtgate.NewScatterConn("", tc, gw)
	return vtgate.NewResolver(serv, cell, sc)
}

// Set up the fake execution environment for the given vschema
func Init(vSchemaStr string) error {
	explainTopo = new(vtExplainTopo)
	fakeHealthCheck = discovery.NewFakeHealthCheck()

	resolver := newFakeResolver(fakeHealthCheck, explainTopo, CELL)

	err := BuildTopo(vSchemaStr)
	if err != nil {
		return err
	}

	normalize := false
	streamSize := 10
	vtgateExecutor = vtgate.NewExecutor(context.Background(), explainTopo, CELL, "", resolver, normalize, streamSize)

	return nil
}

// Run the explain analysis on the given queries
func Run(sqlStr, schemaStr string) ([]*Plan, error) {
	plans := make([]*Plan, 0, 16)

	for _, sql := range strings.Split(sqlStr, ";") {
		s := strings.TrimSpace(sql)
		if s != "" {
			plan, err := GetPlan(s, schemaStr)
			if err != nil {
				return nil, err
			}
			plans = append(plans, plan)
		}
	}

	return plans, nil
}

func GetPlan(sql, schema string) (*Plan, error) {
	plan := Plan{}
	plan.Sql = sql

	_, err := sqlparser.Parse(plan.Sql)
	if err != nil {
		return nil, fmt.Errorf("error parsing sql: %s", err)
	}

	parsedSchema, err := sqlparser.Parse(schema)
	if err != nil {
		return nil, fmt.Errorf("error parsing schema: %s", err)
	}
	fmt.Printf("schema: %v\n", parsedSchema)

	_, err = vtgateExecutor.Execute(context.Background(), masterSession, sql, nil)
	if err != nil {
		return nil, err
	}

	// use the plan cache to get the set of plans used for this query, then
	// clear afterwards for the next run
	planCache := vtgateExecutor.Plans()
	plan.Plans = make([]*engine.Plan, 0, 4)
	for _, item := range planCache.Items() {
		plan.Plans = append(plan.Plans, item.Value.(*engine.Plan))
	}
	planCache.Clear()

	// track each query sent to the tablet and what it ended up actually
	// executing in mysql
	plan.TabletQueries = make(map[string][]TabletQuery)
	for tablet, tc := range explainTopo.TabletConns {
		if len(tc.Queries) == 0 {
			continue
		}

		queries := make([]TabletQuery, 0, 16)
		for _, bq := range tc.Queries {
			tq := TabletQuery{Sql: bq.Sql, BindVars: make(map[string]interface{})}

			// convert []byte values into strings for easier human consumption
			for name, val := range bq.BindVariables {
				switch v := val.(type) {
				case []byte:
					tq.BindVars[name] = string(v)
				default:
					tq.BindVars[name] = v
				}
			}

			mqs, err := fakeTabletExecute(tq.Sql, bq.BindVariables)
			if err != nil {
				return nil, err
			}
			tq.MysqlQueries = mqs
			queries = append(queries, tq)
		}
		plan.TabletQueries[tablet] = queries
		tc.Queries = nil
	}

	return &plan, nil
}
