/*
Copyright 2019 The Vitess Authors.

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
	"errors"
	"fmt"
	"sync"

	"golang.org/x/net/context"

	"vitess.io/vitess/go/mysql"
	"vitess.io/vitess/go/sqltypes"
	"vitess.io/vitess/go/vt/dbconfigs"
	"vitess.io/vitess/go/vt/grpcclient"
	"vitess.io/vitess/go/vt/mysqlctl"
	"vitess.io/vitess/go/vt/vtgate/vindexes"
	"vitess.io/vitess/go/vt/vttablet/queryservice"
	"vitess.io/vitess/go/vt/vttablet/tabletconn"
	"vitess.io/vitess/go/vt/vttablet/tabletserver/connpool"
	"vitess.io/vitess/go/vt/vttablet/tabletserver/schema"
	"vitess.io/vitess/go/vt/vttablet/tabletserver/tabletenv"
	"vitess.io/vitess/go/vt/vttablet/tabletserver/vstreamer"

	binlogdatapb "vitess.io/vitess/go/vt/proto/binlogdata"
	querypb "vitess.io/vitess/go/vt/proto/query"
	topodatapb "vitess.io/vitess/go/vt/proto/topodata"
)

var (
	_      VStreamerClient = (*TabletVStreamerClient)(nil)
	_      VStreamerClient = (*MySQLVStreamerClient)(nil)
	dbcfgs *dbconfigs.DBConfigs
)

// VStreamerClient exposes the core interface of a vstreamer
type VStreamerClient interface {
	// Open sets up all the environment for a vstream
	Open(ctx context.Context) error
	// Close closes a vstream
	Close(ctx context.Context) error

	// VStream streams VReplication events based on the specified filter.
	VStream(ctx context.Context, startPos string, filter *binlogdatapb.Filter, send func([]*binlogdatapb.VEvent) error) error

	// VStreamRows streams rows of a table from the specified starting point.
	VStreamRows(ctx context.Context, query string, lastpk *querypb.QueryResult, send func(*binlogdatapb.VStreamRowsResponse) error) error

	// VStreamResults streams results along with the gtid of the snapshot.
	VStreamResults(ctx context.Context, query string, send func(*binlogdatapb.VStreamResultsResponse) error) error

	// WaitForPosition ...
	WaitForPosition(ctx context.Context, pos string) error
}

// TabletVStreamerClient a vstream client backed by vttablet
type TabletVStreamerClient struct {
	// mu protects isOpen, streamers, streamIdx and kschema.
	mu sync.Mutex

	isOpen bool

	tablet         *topodatapb.Tablet
	mysqld         mysqlctl.MysqlDaemon
	target         *querypb.Target
	tsQueryService queryservice.QueryService
}

// MySQLVStreamerClient a vstream client backed by MySQL
type MySQLVStreamerClient struct {
	// mu protects isOpen, streamers, streamIdx and kschema.
	mu sync.Mutex

	isOpen bool

	sourceCp *mysql.ConnParams
	sourceSe *schema.Engine
}

// NewTabletVStreamerClient creates a new TabletVStreamerClient
func NewTabletVStreamerClient(tablet *topodatapb.Tablet, mysqld mysqlctl.MysqlDaemon) *TabletVStreamerClient {
	return &TabletVStreamerClient{
		tablet: tablet,
		mysqld: mysqld,
		target: &querypb.Target{
			Keyspace:   tablet.Keyspace,
			Shard:      tablet.Shard,
			TabletType: tablet.Type,
		},
	}
}

// Open part of the VStreamerClient interface
func (vsClient *TabletVStreamerClient) Open(ctx context.Context) (err error) {
	vsClient.mu.Lock()
	defer vsClient.mu.Unlock()
	if vsClient.isOpen {
		return nil
	}
	vsClient.isOpen = true

	vsClient.tsQueryService, err = tabletconn.GetDialer()(vsClient.tablet, grpcclient.FailFast(false))
	return err
}

// Close part of the VStreamerClient interface
func (vsClient *TabletVStreamerClient) Close(ctx context.Context) (err error) {
	vsClient.mu.Lock()
	defer vsClient.mu.Unlock()
	if !vsClient.isOpen {
		return nil
	}
	vsClient.isOpen = false
	return vsClient.tsQueryService.Close(ctx)
}

// VStream part of the VStreamerClient interface
func (vsClient *TabletVStreamerClient) VStream(ctx context.Context, startPos string, filter *binlogdatapb.Filter, send func([]*binlogdatapb.VEvent) error) error {
	if !vsClient.isOpen {
		return errors.New("can't VStream without opening client")
	}
	return vsClient.tsQueryService.VStream(ctx, vsClient.target, startPos, filter, send)
}

// VStreamRows part of the VStreamerClient interface
func (vsClient *TabletVStreamerClient) VStreamRows(ctx context.Context, query string, lastpk *querypb.QueryResult, send func(*binlogdatapb.VStreamRowsResponse) error) error {
	if !vsClient.isOpen {
		return errors.New("can't VStreamRows without opening client")
	}
	return vsClient.tsQueryService.VStreamRows(ctx, vsClient.target, query, lastpk, send)
}

// VStreamResults part of the VStreamerClient interface
func (vsClient *TabletVStreamerClient) VStreamResults(ctx context.Context, query string, send func(*binlogdatapb.VStreamResultsResponse) error) error {
	if !vsClient.isOpen {
		return errors.New("can't VStreamRows without opening client")
	}
	vsClient.target.TabletType = topodatapb.TabletType_MASTER
	return vsClient.tsQueryService.VStreamResults(ctx, vsClient.target, query, send)
}

// WaitForPosition ...
func (vsClient *TabletVStreamerClient) WaitForPosition(ctx context.Context, pos string) error {
	targetPos, err := mysql.DecodePosition(pos)
	if err != nil {
		return err
	}
	return vsClient.mysqld.WaitMasterPos(ctx, targetPos)
}

// NewMySQLVStreamerClient is a vstream client that allows you to stream directly from MySQL.
// In order to achieve this, the following creates a vstreamer Engine with a dummy in memorytopo.
func NewMySQLVStreamerClient() *MySQLVStreamerClient {
	if dbcfgs == nil {
		panic("can't use MySQLVStreamerClient without calling InitVStreamerClient() ")
	}
	// TODO: For now external mysql streams can only be used with ExternalReplWithDB creds.
	// In the future we will support multiple users.
	vsClient := &MySQLVStreamerClient{
		sourceCp: dbcfgs.ExternalReplWithDB(),
	}
	return vsClient
}

// Open part of the VStreamerClient interface
func (vsClient *MySQLVStreamerClient) Open(ctx context.Context) (err error) {
	vsClient.mu.Lock()
	defer vsClient.mu.Unlock()
	if vsClient.isOpen {
		return nil
	}
	vsClient.isOpen = true

	// Let's create all the required components by vstreamer

	vsClient.sourceSe = schema.NewEngine(checker{}, tabletenv.DefaultQsConfig)
	vsClient.sourceSe.InitDBConfig(vsClient.sourceCp)
	err = vsClient.sourceSe.Open()
	if err != nil {
		return err
	}
	return nil
}

// Close part of the VStreamerClient interface
func (vsClient *MySQLVStreamerClient) Close(ctx context.Context) (err error) {
	vsClient.mu.Lock()
	defer vsClient.mu.Unlock()
	if !vsClient.isOpen {
		return nil
	}

	vsClient.isOpen = false
	vsClient.sourceSe.Close()
	return nil
}

// VStream part of the VStreamerClient interface
func (vsClient *MySQLVStreamerClient) VStream(ctx context.Context, startPos string, filter *binlogdatapb.Filter, send func([]*binlogdatapb.VEvent) error) error {
	if !vsClient.isOpen {
		return errors.New("can't VStream without opening client")
	}
	streamer := vstreamer.NewVStreamer(ctx, vsClient.sourceCp, vsClient.sourceSe, startPos, filter, &vindexes.KeyspaceSchema{}, send)
	return streamer.Stream()
}

// VStreamRows part of the VStreamerClient interface
func (vsClient *MySQLVStreamerClient) VStreamRows(ctx context.Context, query string, lastpk *querypb.QueryResult, send func(*binlogdatapb.VStreamRowsResponse) error) error {
	if !vsClient.isOpen {
		return errors.New("can't VStreamRows without opening client")
	}
	var row []sqltypes.Value
	if lastpk != nil {
		r := sqltypes.Proto3ToResult(lastpk)
		if len(r.Rows) != 1 {
			return fmt.Errorf("unexpected lastpk input: %v", lastpk)
		}
		row = r.Rows[0]
	}

	streamer := vstreamer.NewRowStreamer(ctx, vsClient.sourceCp, vsClient.sourceSe, query, row, &vindexes.KeyspaceSchema{}, send)
	return streamer.Stream()
}

// VStreamResults part of the VStreamerClient interface
func (vsClient *MySQLVStreamerClient) VStreamResults(ctx context.Context, query string, send func(*binlogdatapb.VStreamResultsResponse) error) error {
	if !vsClient.isOpen {
		return errors.New("can't VStreamRows without opening client")
	}

	streamer := vstreamer.NewResultStreamer(ctx, vsClient.sourceCp, query, send)
	return streamer.Stream()
}

// WaitForPosition returns the master position
func (vsClient *MySQLVStreamerClient) WaitForPosition(ctx context.Context, pos string) error {
	targetPos, err := mysql.DecodePosition(pos)
	if err != nil {
		return err
	}

	// Get a connection.
	params, err := dbconfigs.WithCredentials(vsClient.sourceCp)
	if err != nil {
		return err
	}
	conn, err := mysql.Connect(ctx, params)
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

// InitVStreamerClient initializes config for vstreamer client
func InitVStreamerClient(cfg *dbconfigs.DBConfigs) {
	dbcfgs = cfg
}

type checker struct{}

var _ = connpool.MySQLChecker(checker{})

func (checker) CheckMySQL() {}
