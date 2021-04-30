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
	"encoding/json"
	"fmt"
	"strings"
	"sync"
	"time"

	"vitess.io/vitess/go/vt/log"
	"vitess.io/vitess/go/vt/vtgate/evalengine"

	"vitess.io/vitess/go/vt/vttablet/tmclient"

	"github.com/golang/protobuf/proto"
	"golang.org/x/net/context"
	"vitess.io/vitess/go/mysql"
	"vitess.io/vitess/go/sqltypes"
	"vitess.io/vitess/go/vt/concurrency"
	"vitess.io/vitess/go/vt/discovery"
	"vitess.io/vitess/go/vt/grpcclient"
	"vitess.io/vitess/go/vt/key"
	binlogdatapb "vitess.io/vitess/go/vt/proto/binlogdata"
	querypb "vitess.io/vitess/go/vt/proto/query"
	tabletmanagerdatapb "vitess.io/vitess/go/vt/proto/tabletmanagerdata"
	topodatapb "vitess.io/vitess/go/vt/proto/topodata"
	"vitess.io/vitess/go/vt/sqlparser"
	"vitess.io/vitess/go/vt/topo"
	"vitess.io/vitess/go/vt/topo/topoproto"
	"vitess.io/vitess/go/vt/vterrors"
	"vitess.io/vitess/go/vt/vtgate/engine"
	"vitess.io/vitess/go/vt/vttablet/tabletconn"
)

// DiffReport is the summary of differences for one table.
type DiffReport struct {
	ProcessedRows   int
	MatchingRows    int
	MismatchedRows  int
	ExtraRowsSource int
	ExtraRowsTarget int
}

// vdiff contains the metadata for performing vdiff for one workflow
type tabletVdiffer struct {
	sourceCell     string
	targetCell     string
	sourceKeyspace string
	targetKeyspace string
	tabletTypesStr string

	// differs uses the target table name for its key.
	differs map[string]*tabletTableDiffer

	// The key for sources and targets is the shard name.
	// The source and target keyspaces are pulled from ts.
	sources             map[string]*shardStreamer
	targetShardStreamer *shardStreamer
	target              *tabletTsTarget
	workflow            string

	tmc        tmclient.TabletManagerClient // make remote calls to tablets
	topoServer *topo.Server
}

type tabletTsTarget struct {
	si       *topo.ShardInfo
	master   *topo.TabletInfo
	position string
	sources  map[uint32]*binlogdatapb.BinlogSource
}

// tableDiffer performs a diff for one table in the workflow.
type tabletTableDiffer struct {
	targetTable string
	// sourceExpression and targetExpression are select queries.
	sourceExpression string
	targetExpression string

	// compareCols is the list of non-pk columns to compare.
	// If the value is -1, it's a pk column and should not be
	// compared.
	compareCols []int
	// comparePKs is the list of pk columns to compare. The logic
	// for comparing pk columns is different from compareCols
	comparePKs []int

	// source Primitive and targetPrimitive are used for streaming
	// results from source and target.
	sourcePrimitive engine.Primitive
	targetPrimitive engine.Primitive
}

// shardStreamer streams rows from one shard. This works for
// the source as well as the target.
// shardStreamer satisfies engine.StreamExecutor, and can be
// added to Primitives of engine.MergeSort.
// shardStreamer is a member of vdiff, and gets reused by
// every tableDiffer. A new result channel gets instantiated
// for every tableDiffer iteration.
type shardStreamer struct {
	master           *topo.TabletInfo
	tablet           *topodatapb.Tablet
	position         mysql.Position
	snapshotPosition string
	result           chan *sqltypes.Result
	err              error
}

// newVDiffer creates a new vreplicator
func newVDiffer(ts *topo.Server, tabletTypesStr string) *tabletVdiffer {

	return &tabletVdiffer{
		tabletTypesStr: tabletTypesStr,
		topoServer:     ts,
		tmc:            tmclient.NewTabletManagerClient(),
		sources:        make(map[string]*shardStreamer),
	}
}

// VDiff reports differences between the sources and targets of a vreplication workflow.
/* this method does the following:
- init wrangler
- using the db client exec on the tablet you got, get vrep information (filter)
- now build the traffic switcher with this (or some other name, do we even need this?)
- to make calls to source, use the wrangler + traffic switcher via tmc
- validate the traffic switcher (???)
- init vdiff structure
- build vdiff plan
    - initialize the differs
- select the source tablet (still need to use pickForStreaming so we get the right tablet type)
- for each differ, perform diff and populate our new DiffReport data structure
- final end state, we want this to store some state or something so we can paralellize this from vtctld
*/
func (df *tabletVdiffer) PerformVDiff(ctx context.Context, tablet *topodatapb.Tablet, sourceKeyspace, workflow, sourceCell, targetCell, format string,
	filteredReplicationWaitTime time.Duration) (map[string]*DiffReport, error) {
	// tablet is destination
	// toposerver to make local calls
	// tmc to make remote calls
	// bootstrap defaults
	df.sourceKeyspace = sourceKeyspace
	df.targetKeyspace = tablet.GetKeyspace()
	df.workflow = workflow
	df.sourceCell = sourceCell
	df.targetCell = targetCell

	topoServer := df.topoServer
	destinationTi, err := topoServer.GetTablet(ctx, tablet.Alias)
	if err != nil {
		return nil, err
	}

	destinationShard, err := topoServer.GetShard(ctx, tablet.GetKeyspace(), tablet.Shard)
	if err != nil {
		return nil, err
	}

	destinationMaster, err := topoServer.GetTablet(ctx, destinationShard.MasterAlias)
	if err != nil {
		return nil, err
	}
	// todo: don't need to necessarily query master, just query tablet directly using dbclient
	query := fmt.Sprintf("select id, source, message from _vt.vreplication where workflow=%s and db_name=%s", encodeString(df.workflow), encodeString(destinationMaster.DbName()))
	p3qr, err := df.tmc.VReplicationExec(ctx, destinationMaster.Tablet, query)

	if err != nil {
		log.Infof("error result is %v", err)
		return nil, err
	}
	// If there's no vreplication stream, return early.
	if len(p3qr.Rows) < 1 {
		// continue
		return nil, fmt.Errorf("no vrep stream found")
	}

	// target is just the self tablet we are operating on
	// targets := make(map[string]*tabletTsTarget)
	target := &tabletTsTarget{
		si:      destinationShard,
		master:  destinationMaster,
		sources: make(map[uint32]*binlogdatapb.BinlogSource),
	}
	df.target = target
	df.targetShardStreamer = &shardStreamer{
		master: destinationMaster,
	}

	qr := sqltypes.Proto3ToResult(p3qr)
	// get source information to start streaming rows
	for _, row := range qr.Rows {
		id, err := evalengine.ToInt64(row[0])
		if err != nil {
			continue
		}

		var bls binlogdatapb.BinlogSource
		if err := proto.UnmarshalText(row[1].ToString(), &bls); err != nil {
			continue
		}
		target.sources[uint32(id)] = &bls
	}
	// now that we have the sources, we can start copying data
	// dont need to do through tmc, should have tabletmanager in context and query local tablet
	schm, err := df.tmc.GetSchema(ctx, destinationTi.Tablet, nil, nil, false)
	if err != nil {
		return nil, vterrors.Wrap(err, "GetSchema")
	}

	for _, bls := range df.target.sources {
		sourcesi, err := topoServer.GetShard(ctx, bls.Keyspace, bls.Shard)
		if err != nil {
			return nil, err
		}
		sourceMaster, err := topoServer.GetTablet(ctx, sourcesi.MasterAlias)
		if err != nil {
			return nil, err
		}
		df.sources[bls.Shard] = &shardStreamer{
			master: sourceMaster,
		}
	}

	var oneFilter *binlogdatapb.Filter
	for _, bls := range target.sources {
		oneFilter = bls.Filter
		break
	}

	if err = df.buildVDiffPlan(ctx, oneFilter, schm); err != nil {
		return nil, vterrors.Wrap(err, "buildVDiffPlan")
	}

	if err := df.selectTablets(ctx); err != nil {
		return nil, vterrors.Wrap(err, "selectTablets")
	}

	df.targetShardStreamer.tablet = tablet

	defer func(ctx context.Context) {
		if err := df.restartTarget(ctx); err != nil {
			log.Errorf("Could not restart workflow %s: %v, please restart it manually", df.workflow, err)
		}
	}(ctx)

	// Perform the diffs.
	// We need a cancelable context to abort all running streams
	// if one stream returns an error.
	ctx, cancel := context.WithCancel(ctx)
	defer cancel()

	diffReports := make(map[string]*DiffReport)
	jsonOutput := ""
	for table, td := range df.differs {

		// Stop the target and record their source positions.
		if err := df.stopTarget(ctx); err != nil {
			return nil, vterrors.Wrap(err, "stopTargets")
		}

		// Make sure all sources are past the target's positions and start a query stream that records the current source positions.
		// source keyspace == vreplication data??
		// sources is also vrep data
		if err := df.startQueryStreams(ctx, df.sourceKeyspace, df.sources, td.sourceExpression, filteredReplicationWaitTime); err != nil {
			return nil, vterrors.Wrap(err, "startQueryStreams(sources)")
		}

		// Fast forward the targets to the newly recorded source positions.
		if err := df.syncTargets(ctx, filteredReplicationWaitTime); err != nil {
			return nil, vterrors.Wrap(err, "syncTargets")
		}
		// Sources and targets are in sync. Start query streams on the targets.
		// targetKeyspace == destination tablet keyspace
		// targets is just self tablet
		targets := make(map[string]*shardStreamer)
		targets[df.targetShardStreamer.master.Shard] = df.targetShardStreamer
		if err := df.startQueryStreams(ctx, df.targetKeyspace, targets, td.targetExpression, filteredReplicationWaitTime); err != nil {
			return nil, vterrors.Wrap(err, "startQueryStreams(targets)")
		}

		// Now that queries are running, target vreplication streams can be restarted.
		if err := df.restartTarget(ctx); err != nil {
			return nil, vterrors.Wrap(err, "restartTargets")
		}

		// Perform the diff of source and target streams.
		dr, err := td.diff(ctx)
		if err != nil {
			return nil, vterrors.Wrap(err, "diff")
		}

		if format == "json" {
			json, err := json.MarshalIndent(*dr, "", "")
			if err != nil {
				log.Info("Error converting report to json: %v", err.Error())
			}
			if jsonOutput != "" {
				jsonOutput += ","
			}
			jsonOutput += fmt.Sprintf("%s", json)
		} else {
			log.Infof("Summary for %v: %+v\n", td.targetTable, *dr)
		}

		diffReports[table] = dr
	}
	if format == "json" && jsonOutput != "" {
		log.Info(`[ %s ]`, jsonOutput)
	}

	return diffReports, nil

}

func (df *tabletVdiffer) restartTarget(ctx context.Context) error {
	query := fmt.Sprintf("update _vt.vreplication set state='Running', message='', stop_pos='' where db_name=%s and workflow=%s", encodeString(df.target.master.DbName()), encodeString(df.workflow))
	_, err := df.tmc.VReplicationExec(ctx, df.target.master.Tablet, query)
	return err
}

// buildVDiffPlan builds all the differs.
func (df *tabletVdiffer) buildVDiffPlan(ctx context.Context, filter *binlogdatapb.Filter, schm *tabletmanagerdatapb.SchemaDefinition) error {
	df.differs = make(map[string]*tabletTableDiffer)
	for _, table := range schm.TableDefinitions {
		rule, err := MatchTable(table.Name, filter)
		if err != nil {
			return err
		}
		if rule == nil || rule.Filter == "exclude" {
			continue
		}
		query := rule.Filter
		if rule.Filter == "" || key.IsKeyRange(rule.Filter) {
			buf := sqlparser.NewTrackedBuffer(nil)
			buf.Myprintf("select * from %v", sqlparser.NewTableIdent(table.Name))
			query = buf.String()
		}
		df.differs[table.Name], err = df.buildTablePlan(table, query)
		if err != nil {
			return err
		}
	}
	return nil
}

// buildTablePlan builds one tableDiffer.
func (df *tabletVdiffer) buildTablePlan(table *tabletmanagerdatapb.TableDefinition, query string) (*tabletTableDiffer, error) {
	statement, err := sqlparser.Parse(query)
	if err != nil {
		return nil, err
	}
	sel, ok := statement.(*sqlparser.Select)
	if !ok {
		return nil, fmt.Errorf("unexpected: %v", sqlparser.String(statement))
	}
	td := &tabletTableDiffer{
		targetTable: table.Name,
	}
	sourceSelect := &sqlparser.Select{}
	targetSelect := &sqlparser.Select{}
	// aggregates contains the list if Aggregate functions, if any.
	var aggregates []engine.AggregateParams
	for _, selExpr := range sel.SelectExprs {
		switch selExpr := selExpr.(type) {
		case *sqlparser.StarExpr:
			// If it's a '*' expression, expand column list from the schema.
			for _, fld := range table.Fields {
				aliased := &sqlparser.AliasedExpr{Expr: &sqlparser.ColName{Name: sqlparser.NewColIdent(fld.Name)}}
				sourceSelect.SelectExprs = append(sourceSelect.SelectExprs, aliased)
				targetSelect.SelectExprs = append(targetSelect.SelectExprs, aliased)
			}
		case *sqlparser.AliasedExpr:
			var targetCol *sqlparser.ColName
			if !selExpr.As.IsEmpty() {
				targetCol = &sqlparser.ColName{Name: selExpr.As}
			} else {
				if colAs, ok := selExpr.Expr.(*sqlparser.ColName); ok {
					targetCol = colAs
				} else {
					return nil, fmt.Errorf("expression needs an alias: %v", sqlparser.String(selExpr))
				}
			}
			// If the input was "select a as b", then source will use "a" and target will use "b".
			sourceSelect.SelectExprs = append(sourceSelect.SelectExprs, selExpr)
			targetSelect.SelectExprs = append(targetSelect.SelectExprs, &sqlparser.AliasedExpr{Expr: targetCol})

			// Check if it's an aggregate expression
			if expr, ok := selExpr.Expr.(*sqlparser.FuncExpr); ok {
				switch fname := expr.Name.Lowered(); fname {
				case "count", "sum":
					aggregates = append(aggregates, engine.AggregateParams{
						Opcode: engine.SupportedAggregates[fname],
						Col:    len(sourceSelect.SelectExprs) - 1,
					})
				}
			}
		default:
			return nil, fmt.Errorf("unexpected: %v", sqlparser.String(statement))
		}
	}
	fields := make(map[string]querypb.Type)
	for _, field := range table.Fields {
		fields[strings.ToLower(field.Name)] = field.Type
	}

	// Start with adding all columns for comparison.
	td.compareCols = make([]int, len(sourceSelect.SelectExprs))
	for i := range td.compareCols {
		colname := targetSelect.SelectExprs[i].(*sqlparser.AliasedExpr).Expr.(*sqlparser.ColName).Name.Lowered()
		typ, ok := fields[colname]
		if !ok {
			return nil, fmt.Errorf("column %v not found in table %v", colname, table.Name)
		}
		td.compareCols[i] = i
		if sqltypes.IsText(typ) {
			// For text columns, we need to additionally pull their weight string values for lexical comparisons.
			sourceSelect.SelectExprs = append(sourceSelect.SelectExprs, wrapWeightString(sourceSelect.SelectExprs[i]))
			targetSelect.SelectExprs = append(targetSelect.SelectExprs, wrapWeightString(targetSelect.SelectExprs[i]))
			// Update the column number to point at the weight_string column instead.
			td.compareCols[i] = len(sourceSelect.SelectExprs) - 1
		}
	}

	sourceSelect.From = sel.From
	// The target table name should the one that matched the rule.
	// It can be different from the source table.
	targetSelect.From = sqlparser.TableExprs{
		&sqlparser.AliasedTableExpr{
			Expr: &sqlparser.TableName{
				Name: sqlparser.NewTableIdent(table.Name),
			},
		},
	}

	var orderby sqlparser.OrderBy
	for _, pk := range table.PrimaryKeyColumns {
		found := false
		for i, selExpr := range targetSelect.SelectExprs {
			expr := selExpr.(*sqlparser.AliasedExpr).Expr
			var colname string
			switch ct := expr.(type) {
			case *sqlparser.ColName:
				colname = ct.Name.String()
			case *sqlparser.FuncExpr: //eg. weight_string()
				colname = ct.Name.String()
			default:
				log.Warningf("Unhandled type found for column in vdiff: %v(%v)", selExpr, ct)
				colname = ""
			}
			if strings.EqualFold(pk, colname) {
				td.comparePKs = append(td.comparePKs, td.compareCols[i])
				// We'll be comparing pks separately. So, remove them from compareCols.
				td.compareCols[i] = -1
				found = true
				break
			}
		}
		if !found {
			// Unreachable.
			return nil, fmt.Errorf("column %v not found in table %v", pk, table.Name)
		}
		orderby = append(orderby, &sqlparser.Order{
			Expr:      &sqlparser.ColName{Name: sqlparser.NewColIdent(pk)},
			Direction: sqlparser.AscScr,
		})
	}
	// Remove in_keyrange. It's not understood by mysql.
	sourceSelect.Where = removeKeyrange(sel.Where)
	// The source should also perform the group by.
	sourceSelect.GroupBy = sel.GroupBy
	sourceSelect.OrderBy = orderby

	// The target should perform the order by, but not the group by.
	targetSelect.OrderBy = orderby

	td.sourceExpression = sqlparser.String(sourceSelect)
	td.targetExpression = sqlparser.String(targetSelect)

	td.sourcePrimitive = newMergeSorter(df.sources, td.comparePKs)

	targets := make(map[string]*shardStreamer)
	targets[df.targetShardStreamer.master.Shard] = df.targetShardStreamer
	td.targetPrimitive = newMergeSorter(targets, td.comparePKs)
	// If there were aggregate expressions, we have to re-aggregate
	// the results, which engine.OrderedAggregate can do.
	if len(aggregates) != 0 {
		td.sourcePrimitive = &engine.OrderedAggregate{
			Aggregates: aggregates,
			Keys:       td.comparePKs,
			Input:      td.sourcePrimitive,
		}
	}

	return td, nil
}

// newMergeSorter creates an engine.MergeSort based on the shard streamers and pk columns.
func newMergeSorter(participants map[string]*shardStreamer, comparePKs []int) *engine.MergeSort {
	prims := make([]engine.StreamExecutor, 0, len(participants))
	for _, participant := range participants {
		prims = append(prims, participant)
	}
	ob := make([]engine.OrderbyParams, 0, len(comparePKs))
	for _, cpk := range comparePKs {
		ob = append(ob, engine.OrderbyParams{Col: cpk})
	}
	return &engine.MergeSort{
		Primitives: prims,
		OrderBy:    ob,
	}
}

// selectTablets selects the tablets that will be used for the diff.
func (df *tabletVdiffer) selectTablets(ctx context.Context) error {
	var wg sync.WaitGroup
	var err1 error

	// Parallelize all discovery.
	wg.Add(1)
	go func() {
		defer wg.Done()
		err1 = df.forAll(df.sources, func(shard string, source *shardStreamer) error {

			tp, err := discovery.NewTabletPicker(df.topoServer, []string{df.sourceCell}, df.sourceKeyspace, shard, df.tabletTypesStr)
			if err != nil {
				return err
			}

			tablet, err := tp.PickForStreaming(ctx)
			if err != nil {
				return err
			}
			source.tablet = tablet
			return nil
		})
	}()

	wg.Wait()
	if err1 != nil {
		return err1
	}
	return nil
}

// stopTargets stops all the targets and records their source positions.
func (df *tabletVdiffer) stopTarget(ctx context.Context) error {
	var mu sync.Mutex

	query := fmt.Sprintf("update _vt.vreplication set state='Stopped', message='for vdiff' where db_name=%s and workflow=%s", encodeString(df.targetShardStreamer.master.DbName()), encodeString(df.workflow))
	_, err := df.tmc.VReplicationExec(ctx, df.targetShardStreamer.master.Tablet, query)
	if err != nil {
		return err
	}
	query = fmt.Sprintf("select source, pos from _vt.vreplication where db_name=%s and workflow=%s", encodeString(df.targetShardStreamer.master.DbName()), encodeString(df.workflow))
	p3qr, err := df.tmc.VReplicationExec(ctx, df.targetShardStreamer.master.Tablet, query)
	if err != nil {
		return err
	}
	qr := sqltypes.Proto3ToResult(p3qr)

	for _, row := range qr.Rows {
		var bls binlogdatapb.BinlogSource
		if err := proto.UnmarshalText(row[0].ToString(), &bls); err != nil {
			return err
		}
		pos, err := mysql.DecodePosition(row[1].ToString())
		if err != nil {
			return err
		}
		func() {
			mu.Lock()
			defer mu.Unlock()

			source, ok := df.sources[bls.Shard]
			if !ok {
				// Unreachable.
				return
			}
			if !source.position.IsZero() && source.position.AtLeast(pos) {
				return
			}
			df.sources[bls.Shard].position = pos
		}()
	}
	return nil
}

// starQueryStreams makes sure the sources are past the target's positions, starts the query streams,
// and records the snapshot position of the query. It creates a result channel which StreamExecute
// will use to serve rows.
func (df *tabletVdiffer) startQueryStreams(ctx context.Context, keyspace string, participants map[string]*shardStreamer, query string, filteredReplicationWaitTime time.Duration) error {
	waitCtx, cancel := context.WithTimeout(ctx, filteredReplicationWaitTime)
	defer cancel()
	return df.forAll(participants, func(shard string, participant *shardStreamer) error {

		// Iteration for each participant.
		if err := df.tmc.WaitForPosition(waitCtx, participant.tablet, mysql.EncodePosition(participant.position)); err != nil {
			return vterrors.Wrapf(err, "WaitForPosition for tablet %v", topoproto.TabletAliasString(participant.tablet.Alias))
		}
		participant.result = make(chan *sqltypes.Result, 1)
		gtidch := make(chan string, 1)

		// Start the stream in a separate goroutine.
		go df.streamOne(ctx, keyspace, shard, participant, query, gtidch)

		// Wait for the gtid to be sent. If it's not received, there was an error
		// which would be stored in participant.err.
		gtid, ok := <-gtidch
		if !ok {
			return participant.err
		}
		// Save the new position, as of when the query executed.
		participant.snapshotPosition = gtid
		return nil
	})
}

// streamOne is called as a goroutine, and communicates its results through channels.
// It first sends the snapshot gtid to gtidch.
// Then it streams results to participant.result.
// Before returning, it sets participant.err, and closes all channels.
// If any channel is closed, then participant.err can be checked if there was an error.
// The shardStreamer's StreamExecute consumes the result channel.
func (df *tabletVdiffer) streamOne(ctx context.Context, keyspace, shard string, participant *shardStreamer, query string, gtidch chan string) {
	defer close(participant.result)
	defer close(gtidch)

	// Wrap the streaming in a separate function so we can capture the error.
	// This shows that the error will be set before the channels are closed.
	participant.err = func() error {
		conn, err := tabletconn.GetDialer()(participant.tablet, grpcclient.FailFast(false))
		if err != nil {
			return err
		}
		defer conn.Close(ctx)

		target := &querypb.Target{
			Keyspace:   keyspace,
			Shard:      shard,
			TabletType: participant.tablet.Type,
		}
		var fields []*querypb.Field
		return conn.VStreamResults(ctx, target, query, func(vrs *binlogdatapb.VStreamResultsResponse) error {
			if vrs.Fields != nil {
				fields = vrs.Fields
				gtidch <- vrs.Gtid
			}
			p3qr := &querypb.QueryResult{
				Fields: fields,
				Rows:   vrs.Rows,
			}
			result := sqltypes.Proto3ToResult(p3qr)
			// Fields should be received only once, and sent only once.
			if vrs.Fields == nil {
				result.Fields = nil
			}
			select {
			case participant.result <- result:
			case <-ctx.Done():
				return vterrors.Wrap(ctx.Err(), "VStreamResults")
			}
			return nil
		})
	}()
}

// syncTargets fast-forwards the vreplication to the source snapshot positons
// and waits for the selected tablets to catch up to that point.
func (df *tabletVdiffer) syncTargets(ctx context.Context, filteredReplicationWaitTime time.Duration) error {
	waitCtx, cancel := context.WithTimeout(ctx, filteredReplicationWaitTime)
	defer cancel()
	err := df.forAllUids(func(target *tabletTsTarget, uid uint32) error {
		bls := target.sources[uid]
		pos := df.sources[bls.Shard].snapshotPosition

		query := fmt.Sprintf("update _vt.vreplication set state='Running', stop_pos='%s', message='synchronizing for vdiff' where id=%d", pos, uid)
		if _, err := df.tmc.VReplicationExec(ctx, target.master.Tablet, query); err != nil {
			return err
		}
		if err := df.tmc.VReplicationWaitForPos(waitCtx, target.master.Tablet, int(uid), pos); err != nil {
			return vterrors.Wrapf(err, "VReplicationWaitForPos for tablet %v", topoproto.TabletAliasString(target.master.Tablet.Alias))
		}
		return nil
	})
	if err != nil {
		return err
	}

	pos, err := df.tmc.MasterPosition(ctx, df.targetShardStreamer.master.Tablet)
	if err != nil {
		return err
	}
	mpos, err := mysql.DecodePosition(pos)
	if err != nil {
		return err
	}
	df.targetShardStreamer.position = mpos
	return nil
}

func (df *tabletVdiffer) forAll(participants map[string]*shardStreamer, f func(string, *shardStreamer) error) error {
	var wg sync.WaitGroup
	allErrors := &concurrency.AllErrorRecorder{}
	for shard, participant := range participants {
		wg.Add(1)
		go func(shard string, participant *shardStreamer) {
			defer wg.Done()

			if err := f(shard, participant); err != nil {
				allErrors.RecordError(err)
			}
		}(shard, participant)
	}
	wg.Wait()
	return allErrors.AggrError(vterrors.Aggregate)
}

//-----------------------------------------------------------------
// primitiveExecutor

// primitiveExecutor starts execution on the top level primitive
// and provides convenience functions for row-by-row iteration.
type primitiveExecutor struct {
	prim     engine.Primitive
	rows     [][]sqltypes.Value
	resultch chan *sqltypes.Result
	err      error
}

func newPrimitiveExecutor(ctx context.Context, prim engine.Primitive) *primitiveExecutor {
	pe := &primitiveExecutor{
		prim:     prim,
		resultch: make(chan *sqltypes.Result, 1),
	}
	vcursor := &contextVCursor{ctx: ctx}
	go func() {
		defer close(pe.resultch)
		pe.err = pe.prim.StreamExecute(vcursor, make(map[string]*querypb.BindVariable), false, func(qr *sqltypes.Result) error {
			select {
			case pe.resultch <- qr:
			case <-ctx.Done():
				return vterrors.Wrap(ctx.Err(), "Outer Stream")
			}
			return nil
		})
	}()
	return pe
}

func (pe *primitiveExecutor) next() ([]sqltypes.Value, error) {
	for len(pe.rows) == 0 {
		qr, ok := <-pe.resultch
		if !ok {
			return nil, pe.err
		}
		pe.rows = qr.Rows
	}

	row := pe.rows[0]
	pe.rows = pe.rows[1:]
	return row, nil
}

func (pe *primitiveExecutor) drain(ctx context.Context) (int, error) {
	count := 0
	for {
		row, err := pe.next()
		if err != nil {
			return 0, err
		}
		if row == nil {
			return count, nil
		}
		count++
	}
}

//-----------------------------------------------------------------
// shardStreamer

func (sm *shardStreamer) StreamExecute(vcursor engine.VCursor, bindVars map[string]*querypb.BindVariable, wantfields bool, callback func(*sqltypes.Result) error) error {
	for result := range sm.result {
		if err := callback(result); err != nil {
			return err
		}
	}
	return sm.err
}

//-----------------------------------------------------------------
// tableDiffer

func (td *tabletTableDiffer) diff(ctx context.Context) (*DiffReport, error) {
	sourceExecutor := newPrimitiveExecutor(ctx, td.sourcePrimitive)
	targetExecutor := newPrimitiveExecutor(ctx, td.targetPrimitive)
	dr := &DiffReport{}
	var sourceRow, targetRow []sqltypes.Value
	var err error
	advanceSource := true
	advanceTarget := true
	for {
		if advanceSource {
			sourceRow, err = sourceExecutor.next()
			if err != nil {
				return nil, err
			}
		}
		if advanceTarget {
			targetRow, err = targetExecutor.next()
			if err != nil {
				return nil, err
			}
		}

		if sourceRow == nil && targetRow == nil {
			return dr, nil
		}

		advanceSource = true
		advanceTarget = true

		if sourceRow == nil {
			// drain target, update count
			log.Errorf("Draining extra row(s) found on the target starting with: %v", targetRow)
			count, err := targetExecutor.drain(ctx)
			if err != nil {
				return nil, err
			}
			dr.ExtraRowsTarget += 1 + count
			dr.ProcessedRows += 1 + count
			return dr, nil
		}
		if targetRow == nil {
			// no more rows from the target
			// we know we have rows from source, drain, update count
			log.Errorf("Draining extra row(s) found on the source starting with: %v", sourceRow)
			count, err := sourceExecutor.drain(ctx)
			if err != nil {
				return nil, err
			}
			dr.ExtraRowsSource += 1 + count
			dr.ProcessedRows += 1 + count
			return dr, nil
		}

		dr.ProcessedRows++

		// Compare pk values.
		c, err := td.compare(sourceRow, targetRow, td.comparePKs)
		switch {
		case err != nil:
			return nil, err
		case c < 0:
			if dr.ExtraRowsSource < 10 {
				log.Errorf("[table=%v] Extra row %v on source: %v", td.targetTable, dr.ExtraRowsSource, sourceRow)
			}
			dr.ExtraRowsSource++
			advanceTarget = false
			continue
		case c > 0:
			if dr.ExtraRowsTarget < 10 {
				log.Errorf("[table=%v] Extra row %v on target: %v", td.targetTable, dr.ExtraRowsTarget, targetRow)
			}
			dr.ExtraRowsTarget++
			advanceSource = false
			continue
		}

		// c == 0
		// Compare non-pk values.
		c, err = td.compare(sourceRow, targetRow, td.compareCols)
		switch {
		case err != nil:
			return nil, err
		case c != 0:
			if dr.MismatchedRows < 10 {
				log.Errorf("[table=%v] Different content %v in same PK: %v != %v", td.targetTable, dr.MismatchedRows, sourceRow, targetRow)
			}
			dr.MismatchedRows++
		default:
			dr.MatchingRows++
		}
	}
}

func (td *tabletTableDiffer) compare(sourceRow, targetRow []sqltypes.Value, cols []int) (int, error) {
	for _, col := range cols {
		if col == -1 {
			continue
		}
		c, err := evalengine.NullsafeCompare(sourceRow[col], targetRow[col])
		if err != nil {
			return 0, err
		}
		if c != 0 {
			return c, nil
		}
	}
	return 0, nil
}

//-----------------------------------------------------------------
// contextVCursor

// contextVCursor satisfies VCursor, but only implements Context().
// MergeSort only requires Context to be implemented.
type contextVCursor struct {
	engine.VCursor
	ctx context.Context
}

func (vc *contextVCursor) Context() context.Context {
	return vc.ctx
}

//-----------------------------------------------------------------
// Utility functions

func removeKeyrange(where *sqlparser.Where) *sqlparser.Where {
	if where == nil {
		return nil
	}
	if isFuncKeyrange(where.Expr) {
		return nil
	}
	where.Expr = removeExprKeyrange(where.Expr)
	return where
}

func removeExprKeyrange(node sqlparser.Expr) sqlparser.Expr {
	switch node := node.(type) {
	case *sqlparser.AndExpr:
		if isFuncKeyrange(node.Left) {
			return removeExprKeyrange(node.Right)
		}
		if isFuncKeyrange(node.Right) {
			return removeExprKeyrange(node.Left)
		}
		return &sqlparser.AndExpr{
			Left:  removeExprKeyrange(node.Left),
			Right: removeExprKeyrange(node.Right),
		}
	}
	return node
}

func isFuncKeyrange(expr sqlparser.Expr) bool {
	funcExpr, ok := expr.(*sqlparser.FuncExpr)
	return ok && funcExpr.Name.EqualString("in_keyrange")
}

func wrapWeightString(expr sqlparser.SelectExpr) *sqlparser.AliasedExpr {
	return &sqlparser.AliasedExpr{
		Expr: &sqlparser.FuncExpr{
			Name: sqlparser.NewColIdent("weight_string"),
			Exprs: []sqlparser.SelectExpr{
				&sqlparser.AliasedExpr{
					Expr: expr.(*sqlparser.AliasedExpr).Expr,
				},
			},
		},
	}
}

func (df *tabletVdiffer) forAllUids(f func(target *tabletTsTarget, uid uint32) error) error {
	var wg sync.WaitGroup
	allErrors := &concurrency.AllErrorRecorder{}
	for uid := range df.target.sources {
		wg.Add(1)
		go func(target *tabletTsTarget, uid uint32) {
			defer wg.Done()

			if err := f(target, uid); err != nil {
				allErrors.RecordError(err)
			}
		}(df.target, uid)
	}
	wg.Wait()
	return allErrors.AggrError(vterrors.Aggregate)
}
