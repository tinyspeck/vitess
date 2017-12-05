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

// vtmysqlproxy is a standalone version of the tablet server
package vtmysqlproxy

import (
	"context"
	"flag"
	"fmt"

	log "github.com/golang/glog"

	"github.com/youtube/vitess/go/sqltypes"
	"github.com/youtube/vitess/go/vt/dbconfigs"
	"github.com/youtube/vitess/go/vt/mysqlctl"
	"github.com/youtube/vitess/go/vt/servenv"
	"github.com/youtube/vitess/go/vt/sqlparser"
	"github.com/youtube/vitess/go/vt/tableacl"
	"github.com/youtube/vitess/go/vt/tableacl/simpleacl"
	"github.com/youtube/vitess/go/vt/vttablet/queryservice"
	"github.com/youtube/vitess/go/vt/vttablet/tabletserver"
	"github.com/youtube/vitess/go/vt/vttablet/tabletserver/tabletenv"

	querypb "github.com/youtube/vitess/go/vt/proto/query"
	topodatapb "github.com/youtube/vitess/go/vt/proto/topodata"
)

var (
	mysqlProxy *MysqlProxy
	target     = querypb.Target{
		TabletType: topodatapb.TabletType_MASTER,
		Keyspace:   "",
	}

	normalizeQueries = flag.Bool("normalize_queries", true, "Rewrite queries with bind vars. Turn this off if the app itself sends normalized queries with bind vars.")
)

type MysqlProxy struct {
	qs queryservice.QueryService
}

func (mp *MysqlProxy) Execute(ctx context.Context, session *MysqlProxySession, sql string, bindVariables map[string]*querypb.BindVariable) (*MysqlProxySession, *sqltypes.Result, error) {
	switch sqlparser.Preview(sql) {
	case sqlparser.StmtBegin:
		txID, err := mp.qs.Begin(ctx, &target, session.Options)
		if err != nil {
			return nil, nil, err
		}
		session.transactionID = txID
		return session, &sqltypes.Result{}, err
	case sqlparser.StmtCommit:
		err := mp.qs.Commit(ctx, &target, session.transactionID)
		if err != nil {
			return nil, nil, err
		}
		session.transactionID = 0
		return session, &sqltypes.Result{}, err
	case sqlparser.StmtRollback:
		err := mp.qs.Rollback(ctx, &target, session.transactionID)
		if err != nil {
			return nil, nil, err
		}
		session.transactionID = 0
		return session, &sqltypes.Result{}, err
	default:
		if *normalizeQueries {
			query, comments := sqlparser.SplitTrailingComments(sql)
			stmt, err := sqlparser.Parse(query)
			if err != nil {
				return nil, nil, err
			}
			sqlparser.Normalize(stmt, bindVariables, "vtp")
			normalized := sqlparser.String(stmt)
			sql = normalized + comments
		}

		result, err := mp.qs.Execute(ctx, &target, sql, bindVariables, session.transactionID, session.Options)
		if err != nil {
			return nil, nil, err
		}
		return session, result, nil
	}
}

func (mp *MysqlProxy) Rollback(ctx context.Context, transactionID int64) error {
	return nil
}

type MysqlProxySession struct {
	transactionID int64
	TargetString  string
	Options       *querypb.ExecuteOptions
}

// Init initializes the proxy
func Init(dbcfgs *dbconfigs.DBConfigs, tableACLConfig string) error {
	log.Infof("initalizing vtmysqlproxy")

	// creates and registers the query service
	qs := tabletserver.NewTabletServerWithNilTopoServer(tabletenv.Config)

	mysqlProxy = &MysqlProxy{
		qs: qs,
	}

	servenv.OnRun(func() {
		qs.Register()
		//		qs.SetServingType(topodatapb.TabletType_MASTER, true, []topodatapb.TabletType{})
		//		addStatusParts(qs)
	})

	servenv.OnClose(func() {
		// We now leave the queryservice running during lameduck,
		// so stop it in OnClose(), after lameduck is over.
		qs.StopService()
	})

	if tableACLConfig != "" {
		// To override default simpleacl, other ACL plugins must set themselves to be default ACL factory
		tableacl.Register("simpleacl", &simpleacl.Factory{})

		// tabletacl.Init loads ACL from file if *tableACLConfig is not empty
		err := tableacl.Init(
			tableACLConfig,
			func() {
				qs.ClearQueryPlanCache()
			},
		)
		if err != nil {
			return fmt.Errorf("Failed to initialize Table ACL: %v", err)
		}
	}

	// XXX/demmer replace this with a thinner interface that doesn't include
	// all of mysqlctl
	mysqld := mysqlctl.NewMysqld(
		&mysqlctl.Mycnf{},
		dbcfgs,
		dbconfigs.AppConfig,
	)

	err := qs.StartService(target, *dbcfgs, mysqld)
	if err != nil {
		return err
	}

	return nil
}
