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
	"fmt"
	"strings"
	"sync"
	"time"

	"github.com/golang/protobuf/proto"
	"golang.org/x/net/context"

	"vitess.io/vitess/go/mysql"
	"vitess.io/vitess/go/sqltypes"
	"vitess.io/vitess/go/vt/binlog/binlogplayer"
	"vitess.io/vitess/go/vt/key"
	"vitess.io/vitess/go/vt/log"
	"vitess.io/vitess/go/vt/sqlparser"
	"vitess.io/vitess/go/vt/srvtopo"
	"vitess.io/vitess/go/vt/topo"
	"vitess.io/vitess/go/vt/topo/topoproto"
	"vitess.io/vitess/go/vt/vterrors"
	"vitess.io/vitess/go/vt/vtgate/engine"
	"vitess.io/vitess/go/vt/vttablet/tmclient"

	binlogdatapb "vitess.io/vitess/go/vt/proto/binlogdata"
	querypb "vitess.io/vitess/go/vt/proto/query"
	tabletmanagerdatapb "vitess.io/vitess/go/vt/proto/tabletmanagerdata"
	topodatapb "vitess.io/vitess/go/vt/proto/topodata"
)

// vdiff provides the core logic to start vreplication streams
type vdiff struct {
	id       uint32
	dbClient *vdbClient
	// source
	source          *binlogdatapb.BinlogSource
	sourceVStreamer VStreamerClient
	targetVStreamer VStreamerClient

	stats *binlogplayer.Stats
	vre   *Engine

	differs  map[string]*tableDiffer
	sourceDf *dfParams
	targetDf *dfParams

	tmc      tmclient.TabletManagerClient
	workflow string

	reportMu     sync.Mutex
	totalSummary DiffReport
	diffReports  map[string]*DiffReport
}

// newVDiffer creates a new vreplicator
func newVDiffer(id uint32, source *binlogdatapb.BinlogSource, sourceVStreamer VStreamerClient, stats *binlogplayer.Stats, dbClient binlogplayer.DBClient, vre *Engine, workflow string) *vdiff {
	return &vdiff{
		id:              id,
		source:          source,
		sourceVStreamer: sourceVStreamer,
		stats:           stats,
		dbClient:        newVDBClient(dbClient, stats),
		vre:             vre,
		tmc:             tmclient.NewTabletManagerClient(),
		workflow:        workflow,
		diffReports:     make(map[string]*DiffReport),
	}
}

type DatabaseReport struct {
	GlobalSummary DiffReport             `json:"total_summary,omitempty"`
	TablesReport  map[string]*DiffReport `json:"table_diffs,omitempty"`
}

// DiffReport is the summary of differences for one table.
type DiffReport struct {
	ProcessedRows   int
	MatchingRows    int
	MismatchedRows  int
	ExtraRowsSource int
	ExtraRowsTarget int
}

type tableDiffer struct {
	targetTable      string
	sourceExpression string
	targetExpression string
	compareCols      []int
	comparePKs       []int
	comparePKNames   []string
	sourcePrimitive  engine.Primitive
	targetPrimitive  engine.Primitive
}

type dfParams struct {
	master           *topo.TabletInfo
	vstreamer        VStreamerClient
	position         mysql.Position
	snapshotPosition string
	result           chan *sqltypes.Result
	err              error
}

var currentDatabaseReport *DatabaseReport

// Replicate starts a vreplication stream.
func (df *vdiff) VDiff(ctx context.Context, filteredReplicationWaitTime time.Duration) error {
	df.targetVStreamer = NewTabletVStreamerClient(df.vre.tablet, df.vre.mysqld)

	df.sourceVStreamer.Open(ctx)
	df.targetVStreamer.Open(ctx)
	defer func() {
		df.sourceVStreamer.Close(context.Background())
		df.targetVStreamer.Close(context.Background())
	}()

	tablet, err := df.vre.ts.GetTablet(ctx, df.vre.tablet.GetAlias())
	if err != nil {
		return err
	}

	targetShard, err := df.vre.ts.GetShard(ctx, tablet.GetKeyspace(), tablet.GetShard())
	if err != nil {
		return err
	}

	targetMaster, err := df.vre.ts.GetTablet(ctx, targetShard.MasterAlias)
	if err != nil {
		return err
	}

	df.sourceDf = &dfParams{
		vstreamer: df.sourceVStreamer,
	}

	df.targetDf = &dfParams{
		master:    targetMaster,
		vstreamer: df.targetVStreamer,
	}

	schm, err := df.getSchema(ctx, df.vre.tablet.GetAlias(), nil, nil, false)

	if err != nil {
		return vterrors.Wrap(err, "GetSchema")
	}

	df.differs, err = buildVDiffPlan(ctx, df.source.Filter, schm)
	if err != nil {
		return err
	}

	defer func() {
		if err := df.restartTarget(context.Background()); err != nil {
			log.Error("Could not restart workflow %s: %v, please restart it manually", err)
		}
	}()
	ctx, cancel := context.WithCancel(ctx)
	defer cancel()

	for table, td := range df.differs {
		if err := df.stopTarget(ctx); err != nil {
			return vterrors.Wrap(err, "stopTargets")
		}
		sourceReader, err := df.startQueryStreams(ctx, df.sourceDf, td.sourceExpression, filteredReplicationWaitTime)
		if err != nil {
			return vterrors.Wrap(err, "startQueryStreams(sources)")
		}
		if err := df.syncTargets(ctx, filteredReplicationWaitTime); err != nil {
			return vterrors.Wrap(err, "syncTargets")
		}
		targetReader, err := df.startQueryStreams(ctx, df.targetDf, td.targetExpression, filteredReplicationWaitTime)
		if err != nil {
			return vterrors.Wrap(err, "startQueryStreams(targets)")
		}
		if err := df.restartTarget(ctx); err != nil {
			return vterrors.Wrap(err, "restartTarget")
		}
		dr, err := td.diff(ctx, sourceReader, targetReader)
		if err != nil {
			return vterrors.Wrap(err, "diff")
		}
		log.Infof("Summary for %v: %+v\n", td.targetTable, *dr)
		func() {
			df.reportMu.Lock()
			defer df.reportMu.Unlock()
			df.totalSummary.MatchingRows += dr.MatchingRows
			df.totalSummary.ProcessedRows += dr.ProcessedRows
			df.totalSummary.MismatchedRows += dr.MismatchedRows
			df.totalSummary.ExtraRowsSource += dr.ExtraRowsSource
			df.totalSummary.ExtraRowsTarget += dr.ExtraRowsTarget
			df.diffReports[table] = dr
			currentDatabaseReport = &DatabaseReport{
				GlobalSummary: df.totalSummary,
				TablesReport:  df.diffReports,
			}
		}()
	}
	log.Infof("Total Diffs: processed: %v, matched: %v, extra_rows_source: %v, extra_rows_target: %v, mistmatched_rows: %v", df.totalSummary.ProcessedRows, df.totalSummary.MatchingRows, df.totalSummary.ExtraRowsSource, df.totalSummary.ExtraRowsTarget, df.totalSummary.MismatchedRows)
	return nil
}

func VDiffStatus() *DatabaseReport {
	return currentDatabaseReport
}

func buildVDiffPlan(ctx context.Context, filter *binlogdatapb.Filter, schm *tabletmanagerdatapb.SchemaDefinition) (map[string]*tableDiffer, error) {
	differs := make(map[string]*tableDiffer)
	for _, table := range schm.TableDefinitions {
		rule, err := MatchTable(table.Name, filter)
		if err != nil {
			return nil, err
		}
		if rule == nil {
			continue
		}
		query := rule.Filter
		if rule.Filter == "" || key.IsKeyRange(rule.Filter) {
			buf := sqlparser.NewTrackedBuffer(nil)
			buf.Myprintf("select * from %v", sqlparser.NewTableIdent(table.Name))
			query = buf.String()
		}
		differs[table.Name], err = buildDifferPlan(table, query)
		if err != nil {
			return nil, err
		}
	}
	return differs, nil
}

func buildDifferPlan(table *tabletmanagerdatapb.TableDefinition, query string) (*tableDiffer, error) {
	statement, err := sqlparser.Parse(query)
	if err != nil {
		return nil, err
	}
	sel, ok := statement.(*sqlparser.Select)
	if !ok {
		return nil, fmt.Errorf("unexpected: %v", sqlparser.String(statement))
	}
	td := &tableDiffer{
		targetTable: table.Name,
	}
	sourceSelect := &sqlparser.Select{}
	targetSelect := &sqlparser.Select{}
	var aggregates []engine.AggregateParams
	for _, selExpr := range sel.SelectExprs {
		switch selExpr := selExpr.(type) {
		case *sqlparser.StarExpr:
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

	td.compareCols = make([]int, len(sourceSelect.SelectExprs))
	for i := range td.compareCols {
		colname := targetSelect.SelectExprs[i].(*sqlparser.AliasedExpr).Expr.(*sqlparser.ColName).Name.Lowered()
		typ, ok := fields[colname]
		if !ok {
			return nil, fmt.Errorf("column %v not found in table %v", colname, table.Name)
		}
		td.compareCols[i] = i
		if sqltypes.IsText(typ) {
			sourceSelect.SelectExprs = append(sourceSelect.SelectExprs, wrapWeightString(sourceSelect.SelectExprs[i]))
			targetSelect.SelectExprs = append(targetSelect.SelectExprs, wrapWeightString(targetSelect.SelectExprs[i]))
			td.compareCols[i] = len(sourceSelect.SelectExprs) - 1
		}
	}

	sourceSelect.From = sel.From
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
			colname := selExpr.(*sqlparser.AliasedExpr).Expr.(*sqlparser.ColName).Name.Lowered()
			if pk == colname {
				td.comparePKs = append(td.comparePKs, td.compareCols[i])
				td.comparePKNames = append(td.comparePKNames, colname)
				// We'll be comparing pks seperately. So, remove them from compareCols.
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
	sourceSelect.Where = removeKeyrange(sel.Where)
	sourceSelect.GroupBy = sel.GroupBy
	sourceSelect.OrderBy = orderby

	targetSelect.OrderBy = orderby

	td.sourceExpression = sqlparser.String(sourceSelect)
	td.targetExpression = sqlparser.String(targetSelect)

	td.sourcePrimitive = newMergeSorter(td.comparePKs)
	td.targetPrimitive = newMergeSorter(td.comparePKs)
	if len(aggregates) != 0 {
		td.sourcePrimitive = &engine.OrderedAggregate{
			Aggregates: aggregates,
			Keys:       td.comparePKs,
			Input:      td.sourcePrimitive,
		}
	}

	return td, nil
}

func (df *vdiff) startQueryStreams(ctx context.Context, participant *dfParams, query string, filteredReplicationWaitTime time.Duration) (*resultReader, error) {
	waitCtx, cancel := context.WithTimeout(ctx, filteredReplicationWaitTime)
	defer cancel()
	// Iteration for each participant.

	if err := participant.vstreamer.WaitForPosition(waitCtx, mysql.EncodePosition(participant.position)); err != nil {
		return nil, vterrors.Wrapf(err, "WaitForPosition for tablet %v", participant.vstreamer)
	}
	participant.result = make(chan *sqltypes.Result, 1)
	gtidch := make(chan string, 1)

	// Start the stream in a separate goroutine.
	go df.streamOne(ctx, participant, query, gtidch)

	// Wait for the gtid to be sent. If it's not received, there was an error
	// which would be stored in participant.err.
	gtid, ok := <-gtidch
	if !ok {
		return nil, participant.err
	}
	// Save the new position, as of when the query executed.
	participant.snapshotPosition = gtid
	return newResultReader(ctx, participant), nil
}

// streamOne is called as a goroutine, and communicates its results through channels.
// It first sends the snapshot gtid to gtidch.
// Then it streams results to participant.result.
// Before returning, it sets participant.err, and closes all channels.
// If any channel is closed, then participant.err can be checked if there was an error.
func (df *vdiff) streamOne(ctx context.Context, participant *dfParams, query string, gtidch chan string) {
	defer close(participant.result)
	defer close(gtidch)

	// Wrap the streaming in a separate function so we can capture the error.
	// This shows that the error will be set before the channels are closed.
	participant.err = func() error {
		var fields []*querypb.Field
		err := participant.vstreamer.VStreamResults(ctx, query, func(vrs *binlogdatapb.VStreamResultsResponse) error {
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
		return err
	}()
}

func (df *vdiff) syncTargets(ctx context.Context, filteredReplicationWaitTime time.Duration) error {
	waitCtx, cancel := context.WithTimeout(ctx, filteredReplicationWaitTime)
	defer cancel()
	pos := df.sourceDf.snapshotPosition
	query := fmt.Sprintf("update _vt.vreplication set state='Running', stop_pos='%s', message='synchronizing for vdiff' where id=%d", pos, df.id)
	if _, err := df.tmc.VReplicationExec(ctx, df.targetDf.master.Tablet, query); err != nil {
		return err
	}

	if err := df.tmc.VReplicationWaitForPos(waitCtx, df.targetDf.master.Tablet, int(df.id), pos); err != nil {
		return vterrors.Wrapf(err, "VReplicationWaitForPos for tablet %v", topoproto.TabletAliasString(df.targetDf.master.Tablet.Alias))
	}
	log.Infof("VReplication successfully stopped at position: %v", pos)

	pos, err := df.tmc.MasterPosition(ctx, df.targetDf.master.Tablet)
	if err != nil {
		return err
	}
	mpos, err := mysql.DecodePosition(pos)
	if err != nil {
		return err
	}
	df.targetDf.position = mpos
	return nil
}

func (df *vdiff) restartTarget(ctx context.Context) error {
	query := fmt.Sprintf("update _vt.vreplication set state='Running', message='', stop_pos='' where db_name=%s and workflow=%s", encodeString(df.targetDf.master.DbName()), encodeString(df.workflow))
	_, err := df.tmc.VReplicationExec(ctx, df.targetDf.master.Tablet, query)
	return err
}

func (df *vdiff) getSchema(ctx context.Context, tabletAlias *topodatapb.TabletAlias, tables, excludeTables []string, includeViews bool) (*tabletmanagerdatapb.SchemaDefinition, error) {
	ti, err := df.vre.ts.GetTablet(ctx, tabletAlias)
	if err != nil {
		return nil, fmt.Errorf("GetTablet(%v) failed: %v", tabletAlias, err)
	}

	return df.tmc.GetSchema(ctx, ti.Tablet, tables, excludeTables, includeViews)
}

//-----------------------------------------------------------------
// primitiveExecutor

type primitiveExecutor struct {
	prim     engine.Primitive
	rows     [][]sqltypes.Value
	resultch chan *sqltypes.Result
	err      error
}

func newPrimitiveExecutor(ctx context.Context, vcursor engine.VCursor, prim engine.Primitive) *primitiveExecutor {
	pe := &primitiveExecutor{
		prim:     prim,
		resultch: make(chan *sqltypes.Result, 1),
	}
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
// mergeSorter

var _ engine.Primitive = (*mergeSorter)(nil)

// mergeSorter performs a merge-sorted read from the participants.
type mergeSorter struct {
	engine.Primitive
	orderBy []engine.OrderbyParams
}

func newMergeSorter(comparePKs []int) *mergeSorter {
	ob := make([]engine.OrderbyParams, 0, len(comparePKs))
	for _, col := range comparePKs {
		ob = append(ob, engine.OrderbyParams{Col: col})
	}
	return &mergeSorter{
		orderBy: ob,
	}
}

func (ms *mergeSorter) StreamExecute(vcursor engine.VCursor, bindVars map[string]*querypb.BindVariable, wantields bool, callback func(*sqltypes.Result) error) error {
	// TODO: I don't really need to do a merge sort here, is a single stream, but I'm lazy and don't want to think.
	_, ok := vcursor.(*resultReader)
	if !ok {
		return fmt.Errorf("internal error: vcursor is not a resultReader: %T", vcursor)
	}
	rss := make([]*srvtopo.ResolvedShard, 0, 1)
	bvs := make([]map[string]*querypb.BindVariable, 0, 1)
	rss = append(rss, &srvtopo.ResolvedShard{
		Target: &querypb.Target{
			Shard: "-",
		},
	})
	bvs = append(bvs, bindVars)
	return engine.MergeSort(vcursor, "", ms.orderBy, rss, bvs, callback)
}

//-----------------------------------------------------------------
// resultReader

// resultReader acts as a VCursor for the wrapping primitives.
type resultReader struct {
	engine.VCursor
	ctx         context.Context
	participant *dfParams
}

func newResultReader(ctx context.Context, participant *dfParams) *resultReader {
	return &resultReader{
		ctx:         ctx,
		participant: participant,
	}
}

func (rr *resultReader) Context() context.Context {
	return rr.ctx
}

func (rr *resultReader) StreamExecuteMulti(query string, rss []*srvtopo.ResolvedShard, bindVars []map[string]*querypb.BindVariable, callback func(reply *sqltypes.Result) error) error {
	for result := range rr.participant.result {
		if err := callback(result); err != nil {
			return err
		}
	}
	return nil
}

//-----------------------------------------------------------------
// tableDiffer

func (td *tableDiffer) diff(ctx context.Context, sourceReader, targetReader *resultReader) (*DiffReport, error) {
	sourceExecutor := newPrimitiveExecutor(ctx, sourceReader, td.sourcePrimitive)
	targetExecutor := newPrimitiveExecutor(ctx, targetReader, td.targetPrimitive)
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
			pk := td.pkString(targetRow)
			log.Errorf("Draining extra row(s) found on the target. This is the extra row pk: %v", pk)
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
			pk := td.pkString(sourceRow)
			log.Errorf("Draining extra row(s) found on the source. This is the extra row pk: %v", pk)
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
		c, _, err := td.compare(sourceRow, targetRow, td.comparePKs)
		switch {
		case err != nil:
			return nil, err
		case c < 0:
			if dr.ExtraRowsSource < 10 {
				log.Errorf("[table=%v] Extra row %v on source: %v", td.targetTable, dr.ExtraRowsSource, td.pkString(sourceRow))
			}
			dr.ExtraRowsSource++
			advanceTarget = false
			continue
		case c > 0:
			if dr.ExtraRowsTarget < 10 {
				log.Errorf("[table=%v] Extra row %v on target: %v", td.targetTable, dr.ExtraRowsTarget, td.pkString(targetRow))
			}
			dr.ExtraRowsTarget++
			advanceSource = false
			continue
		}

		// c == 0
		// Compare non-pk values.
		c, _, err = td.compare(sourceRow, targetRow, td.compareCols)
		switch {
		case err != nil:
			return nil, err
		case c != 0:
			if dr.MismatchedRows < 10 {
				log.Errorf("[table=%v] Different content for PK: %v", td.targetTable, td.pkString(sourceRow))
			}
			dr.MismatchedRows++
		default:
			dr.MatchingRows++
		}
	}
}

func (td *tableDiffer) pkString(targetRow []sqltypes.Value) string {
	pk := ""
	for index, col := range td.comparePKs {
		if col == -1 {
			continue
		}
		pk += fmt.Sprintf("%v:%v", td.comparePKNames[index], targetRow[col].String())
		if index < len(td.comparePKs)-1 {
			pk += ", "
		}
	}
	return pk
}

func (td *tableDiffer) compare(sourceRow, targetRow []sqltypes.Value, cols []int) (int, int, error) {
	for _, col := range cols {
		if col == -1 {
			continue
		}
		c, err := sqltypes.NullsafeCompare(sourceRow[col], targetRow[col])
		if err != nil {
			return 0, 0, err
		}
		if c != 0 {
			return c, col, nil
		}
	}
	return 0, 0, nil
}

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
	case *sqlparser.ParenExpr:
		return &sqlparser.ParenExpr{
			Expr: removeExprKeyrange(node.Expr),
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

func (df *vdiff) stopTarget(ctx context.Context) error {
	var mu sync.Mutex

	query := fmt.Sprintf("update _vt.vreplication set state='Stopped', message='for vdiff' where db_name=%s and workflow=%s", encodeString(df.targetDf.master.DbName()), encodeString(df.workflow))
	_, err := df.tmc.VReplicationExec(ctx, df.targetDf.master.Tablet, query)
	if err != nil {
		return err
	}
	query = fmt.Sprintf("select source, pos from _vt.vreplication where db_name=%s and workflow=%s", encodeString(df.targetDf.master.DbName()), encodeString(df.workflow))
	p3qr, err := df.tmc.VReplicationExec(ctx, df.targetDf.master.Tablet, query)
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

			// if bls.Shard != df.shard {
			// 	// Unreachable.
			// 	return
			// }
			if !df.sourceDf.position.IsZero() && df.sourceDf.position.AtLeast(pos) {
				return
			}
			df.sourceDf.position = pos
		}()
	}
	return nil
}
