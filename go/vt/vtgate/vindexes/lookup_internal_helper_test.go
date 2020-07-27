package vindexes

import (
	"vitess.io/vitess/go/sqltypes"
	querypb "vitess.io/vitess/go/vt/proto/query"
	vtgatepb "vitess.io/vitess/go/vt/proto/vtgate"
)

type litVCursor struct {
	callCount int
	queries   []string
	bindvars  []map[string]*querypb.BindVariable
	results   []execResult
}

type execResult struct {
	result *sqltypes.Result
	err    error
}

func (l execResult) getResult() (*sqltypes.Result, error) {
	return l.result, l.err
}

type vcRow struct {
	key sqltypes.Value
	id  string
}

func newVCResult(contents ...vcRow) *sqltypes.Result {
	r := &sqltypes.Result{
		Fields:       sqltypes.MakeTestFields("key|col", "int64|varchar"),
		RowsAffected: uint64(len(contents)),
	}
	for _, c := range contents {
		r.Rows = append(r.Rows, []sqltypes.Value{
			c.key,
			sqltypes.NewVarChar(c.id),
		})
	}
	return r
}

func newLitVCursor(executeResult ...execResult) *litVCursor {
	lvc := &litVCursor{
		callCount: 0,
		queries:   []string{},
		bindvars:  []map[string]*querypb.BindVariable{},
		results:   executeResult,
	}
	return lvc
}

func (lvc *litVCursor) Execute(
	method string,
	query string,
	bindvars map[string]*querypb.BindVariable,
	rollbackOnError bool,
	co vtgatepb.CommitOrder,
) (*sqltypes.Result, error) {
	r := lvc.results[lvc.callCount]
	lvc.callCount = lvc.callCount + 1
	lvc.queries = append(lvc.queries, query)
	lvc.bindvars = append(lvc.bindvars, bindvars)
	return r.getResult()
}

func (*litVCursor) ExecuteKeyspaceID(_ string, _ []byte, _ string, _ map[string]*querypb.BindVariable, _, _ bool) (*sqltypes.Result, error) {
	panic("do not call")
}
