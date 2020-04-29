/*
Copyright 2020 The Vitess Authors.

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

package vreplication

import (
	"fmt"
	"sync"

	"golang.org/x/net/context"

	"vitess.io/vitess/go/mysql"
	"vitess.io/vitess/go/sqltypes"
	"vitess.io/vitess/go/vt/dbconfigs"
	"vitess.io/vitess/go/vt/grpcclient"
	"vitess.io/vitess/go/vt/mysqlctl"
	binlogdatapb "vitess.io/vitess/go/vt/proto/binlogdata"
	querypb "vitess.io/vitess/go/vt/proto/query"
	topodatapb "vitess.io/vitess/go/vt/proto/topodata"
	vtrpcpb "vitess.io/vitess/go/vt/proto/vtrpc"
	"vitess.io/vitess/go/vt/vterrors"
	"vitess.io/vitess/go/vt/vttablet/queryservice"
	"vitess.io/vitess/go/vt/vttablet/tabletconn"
	"vitess.io/vitess/go/vt/vttablet/tabletserver/schema"
	"vitess.io/vitess/go/vt/vttablet/tabletserver/tabletenv"
	"vitess.io/vitess/go/vt/vttablet/tabletserver/vstreamer"
)

var (
	_ VStreamerClient = (*mysqlConnector)(nil)
	_ VStreamerClient = (*tabletConnector)(nil)
)

// VStreamerClient exposes the core interface of a vstreamer
type VStreamerClient interface {
	Open(context.Context) error
	Close(context.Context) error

	// VStream streams VReplication events based on the specified filter.
	VStream(ctx context.Context, startPos string, filter *binlogdatapb.Filter, send func([]*binlogdatapb.VEvent) error) error

	// VStreamRows streams rows of a table from the specified starting point.
	VStreamRows(ctx context.Context, query string, lastpk *querypb.QueryResult, send func(*binlogdatapb.VStreamRowsResponse) error) error

	// Vdiff hacks slack
	// VStreamResults streams results along with the gtid of the snapshot.
	VStreamResults(ctx context.Context, query string, send func(*binlogdatapb.VStreamResultsResponse) error) error

	// WaitForPosition ...
	WaitForPosition(ctx context.Context, pos string) error
}

type externalConnector struct {
	mu         sync.Mutex
	dbconfigs  map[string]*dbconfigs.DBConfigs
	connectors map[string]*mysqlConnector
}

func newExternalConnector(dbcfgs map[string]*dbconfigs.DBConfigs) *externalConnector {
	return &externalConnector{
		dbconfigs:  dbcfgs,
		connectors: make(map[string]*mysqlConnector),
	}
}

func (ec *externalConnector) Close() {
	for _, c := range ec.connectors {
		c.shutdown()
	}
	ec.connectors = make(map[string]*mysqlConnector)
}

func (ec *externalConnector) Get(name string) (*mysqlConnector, error) {
	ec.mu.Lock()
	defer ec.mu.Unlock()
	if c, ok := ec.connectors[name]; ok {
		return c, nil
	}

	// Construct
	config := tabletenv.NewDefaultConfig()
	config.DB = ec.dbconfigs[name]
	if config.DB == nil {
		return nil, vterrors.Errorf(vtrpcpb.Code_NOT_FOUND, "external mysqlConnector %v not found", name)
	}
	c := &mysqlConnector{}
	c.env = tabletenv.NewEnv(config, name)
	c.se = schema.NewEngine(c.env)
	c.vstreamer = vstreamer.NewEngine(c.env, nil, c.se)
	c.se.InitDBConfig(c.env.Config().DB.DbaWithDB())

	// Open
	if err := c.se.Open(); err != nil {
		return nil, vterrors.Wrapf(err, "external mysqlConnector: %v", name)
	}
	c.vstreamer.Open("", "")

	// Register
	ec.connectors[name] = c
	return c, nil
}

//-----------------------------------------------------------

type mysqlConnector struct {
	env       tabletenv.Env
	se        *schema.Engine
	vstreamer *vstreamer.Engine
}

func (c *mysqlConnector) shutdown() {
	c.vstreamer.Close()
	c.se.Close()
}

func (c *mysqlConnector) Open(ctx context.Context) error {
	return nil
}

func (c *mysqlConnector) Close(ctx context.Context) error {
	return nil
}

func (c *mysqlConnector) VStream(ctx context.Context, startPos string, filter *binlogdatapb.Filter, send func([]*binlogdatapb.VEvent) error) error {
	return c.vstreamer.Stream(ctx, startPos, filter, send)
}

func (c *mysqlConnector) VStreamRows(ctx context.Context, query string, lastpk *querypb.QueryResult, send func(*binlogdatapb.VStreamRowsResponse) error) error {
	var row []sqltypes.Value
	if lastpk != nil {
		r := sqltypes.Proto3ToResult(lastpk)
		if len(r.Rows) != 1 {
			return vterrors.Errorf(vtrpcpb.Code_INVALID_ARGUMENT, "unexpected lastpk input: %v", lastpk)
		}
		row = r.Rows[0]
	}
	return c.vstreamer.StreamRows(ctx, query, row, send)
}

// VStreamResults part of the VStreamerClient interface
func (c *mysqlConnector) VStreamResults(ctx context.Context, query string, send func(*binlogdatapb.VStreamResultsResponse) error) error {
	return c.vstreamer.StreamResults(ctx, query, send)
}

// WaitForPosition returns the master position
func (c *mysqlConnector) WaitForPosition(ctx context.Context, pos string) error {
	targetPos, err := mysql.DecodePosition(pos)
	if err != nil {
		return err
	}

	conn, err := c.env.Config().DB.ExternalRepl().Connect(ctx)
	if err != nil {
		return fmt.Errorf("error in connecting to mysql db, err %v", err)
	}

	defer conn.Close()

	// If we are the master, WaitUntilPositionCommand will fail.
	// But position is most likely reached. So, check the position
	// first.
	mpos, err := conn.MasterPosition()
	if err != nil {
		return fmt.Errorf("WaitMasterPos: MasterPosition failed: %v", err)
	}
	if mpos.AtLeast(targetPos) {
		return nil
	}

	// Find the query to run, run it.
	query, err := conn.WaitUntilPositionCommand(ctx, targetPos)
	if err != nil {
		return err
	}
	qr, err := executeFetchContext(ctx, conn, query, 1, true)
	if err != nil {
		return fmt.Errorf("WaitUntilPositionCommand(%v) failed: %v", query, err)
	}
	if len(qr.Rows) != 1 || len(qr.Rows[0]) != 1 {
		return fmt.Errorf("unexpected result format from WaitUntilPositionCommand(%v): %#v", query, qr)
	}
	result := qr.Rows[0][0]
	if result.IsNull() {
		return fmt.Errorf("WaitUntilPositionCommand(%v) failed: replication is probably stopped", query)
	}
	if result.ToString() == "-1" {
		return fmt.Errorf("timed out waiting for position %v", targetPos)
	}
	return nil
}

func executeFetchContext(ctx context.Context, conn *mysql.Conn, query string, maxrows int, wantfields bool) (*sqltypes.Result, error) {
	// Fast fail if context is done.
	select {
	case <-ctx.Done():
		return nil, ctx.Err()
	default:
	}

	// Execute asynchronously so we can select on both it and the context.
	var qr *sqltypes.Result
	var executeErr error
	done := make(chan struct{})
	go func() {
		defer close(done)

		qr, executeErr = conn.ExecuteFetch(query, maxrows, wantfields)
	}()

	// Wait for either the query or the context to be done.
	select {
	case <-done:
		return qr, executeErr
	case <-ctx.Done():
		// If both are done already, we may end up here anyway because select
		// chooses among multiple ready channels pseudorandomly.
		// Check the done channel and prefer that one if it's ready.
		select {
		case <-done:
			return qr, executeErr
		default:
		}

		// Wait for the conn.ExecuteFetch() call to return.
		<-done
		// Close the connection. Upon Recycle() it will be thrown out.
		conn.Close()
		// ExecuteFetch() may have succeeded before we tried to kill it.
		// If ExecuteFetch() had returned because we cancelled it,
		// then executeErr would be an error like "MySQL has gone away".
		if executeErr == nil {
			return qr, executeErr
		}
		return nil, ctx.Err()
	}
}

//-----------------------------------------------------------

type tabletConnector struct {
	tablet *topodatapb.Tablet
	target *querypb.Target
	qs     queryservice.QueryService
	mysqld mysqlctl.MysqlDaemon
}

func newTabletConnector(tablet *topodatapb.Tablet, mysqld mysqlctl.MysqlDaemon) *tabletConnector {
	return &tabletConnector{
		tablet: tablet,
		mysqld: mysqld,
		target: &querypb.Target{
			Keyspace:   tablet.Keyspace,
			Shard:      tablet.Shard,
			TabletType: tablet.Type,
		},
	}
}

func (tc *tabletConnector) Open(ctx context.Context) error {
	var err error
	tc.qs, err = tabletconn.GetDialer()(tc.tablet, grpcclient.FailFast(true))
	return err
}

func (tc *tabletConnector) Close(ctx context.Context) error {
	return tc.qs.Close(ctx)
}

func (tc *tabletConnector) VStream(ctx context.Context, startPos string, filter *binlogdatapb.Filter, send func([]*binlogdatapb.VEvent) error) error {
	return tc.qs.VStream(ctx, tc.target, startPos, filter, send)
}

func (tc *tabletConnector) VStreamRows(ctx context.Context, query string, lastpk *querypb.QueryResult, send func(*binlogdatapb.VStreamRowsResponse) error) error {
	return tc.qs.VStreamRows(ctx, tc.target, query, lastpk, send)
}

// WaitForPosition ...
func (tc *tabletConnector) WaitForPosition(ctx context.Context, pos string) error {
	targetPos, err := mysql.DecodePosition(pos)
	if err != nil {
		return err
	}
	return tc.mysqld.WaitMasterPos(ctx, targetPos)
}

// VStreamResults part of the VStreamerClient interface
func (tc *tabletConnector) VStreamResults(ctx context.Context, query string, send func(*binlogdatapb.VStreamResultsResponse) error) error {
	tc.target.TabletType = topodatapb.TabletType_MASTER
	return tc.qs.VStreamResults(ctx, tc.target, query, send)
}
