// Code generated by MockGen. DO NOT EDIT.
// Source: vitess.io/vitess/go/vt/vtgate/vtgateconn (interfaces: Impl)

// Package vtgateconn is a generated GoMock package.
package vtgateconn

import (
	context "context"
	gomock "github.com/golang/mock/gomock"
	reflect "reflect"
	sqltypes "vitess.io/vitess/go/sqltypes"
	binlogdata "vitess.io/vitess/go/vt/proto/binlogdata"
	query "vitess.io/vitess/go/vt/proto/query"
	topodata "vitess.io/vitess/go/vt/proto/topodata"
	vtgate "vitess.io/vitess/go/vt/proto/vtgate"
)

// MockImpl is a mock of Impl interface
type MockImpl struct {
	ctrl     *gomock.Controller
	recorder *MockImplMockRecorder
}

// MockImplMockRecorder is the mock recorder for MockImpl
type MockImplMockRecorder struct {
	mock *MockImpl
}

// NewMockImpl creates a new mock instance
func NewMockImpl(ctrl *gomock.Controller) *MockImpl {
	mock := &MockImpl{ctrl: ctrl}
	mock.recorder = &MockImplMockRecorder{mock}
	return mock
}

// EXPECT returns an object that allows the caller to indicate expected use
func (m *MockImpl) EXPECT() *MockImplMockRecorder {
	return m.recorder
}

// Begin mocks base method
func (m *MockImpl) Begin(arg0 context.Context, arg1 bool) (*vtgate.Session, error) {
	m.ctrl.T.Helper()
	ret := m.ctrl.Call(m, "Begin", arg0, arg1)
	ret0, _ := ret[0].(*vtgate.Session)
	ret1, _ := ret[1].(error)
	return ret0, ret1
}

// Begin indicates an expected call of Begin
func (mr *MockImplMockRecorder) Begin(arg0, arg1 interface{}) *gomock.Call {
	mr.mock.ctrl.T.Helper()
	return mr.mock.ctrl.RecordCallWithMethodType(mr.mock, "Begin", reflect.TypeOf((*MockImpl)(nil).Begin), arg0, arg1)
}

// Close mocks base method
func (m *MockImpl) Close() {
	m.ctrl.T.Helper()
	m.ctrl.Call(m, "Close")
}

// Close indicates an expected call of Close
func (mr *MockImplMockRecorder) Close() *gomock.Call {
	mr.mock.ctrl.T.Helper()
	return mr.mock.ctrl.RecordCallWithMethodType(mr.mock, "Close", reflect.TypeOf((*MockImpl)(nil).Close))
}

// Commit mocks base method
func (m *MockImpl) Commit(arg0 context.Context, arg1 *vtgate.Session, arg2 bool) error {
	m.ctrl.T.Helper()
	ret := m.ctrl.Call(m, "Commit", arg0, arg1, arg2)
	ret0, _ := ret[0].(error)
	return ret0
}

// Commit indicates an expected call of Commit
func (mr *MockImplMockRecorder) Commit(arg0, arg1, arg2 interface{}) *gomock.Call {
	mr.mock.ctrl.T.Helper()
	return mr.mock.ctrl.RecordCallWithMethodType(mr.mock, "Commit", reflect.TypeOf((*MockImpl)(nil).Commit), arg0, arg1, arg2)
}

// Execute mocks base method
func (m *MockImpl) Execute(arg0 context.Context, arg1 *vtgate.Session, arg2 string, arg3 map[string]*query.BindVariable) (*vtgate.Session, *sqltypes.Result, error) {
	m.ctrl.T.Helper()
	ret := m.ctrl.Call(m, "Execute", arg0, arg1, arg2, arg3)
	ret0, _ := ret[0].(*vtgate.Session)
	ret1, _ := ret[1].(*sqltypes.Result)
	ret2, _ := ret[2].(error)
	return ret0, ret1, ret2
}

// Execute indicates an expected call of Execute
func (mr *MockImplMockRecorder) Execute(arg0, arg1, arg2, arg3 interface{}) *gomock.Call {
	mr.mock.ctrl.T.Helper()
	return mr.mock.ctrl.RecordCallWithMethodType(mr.mock, "Execute", reflect.TypeOf((*MockImpl)(nil).Execute), arg0, arg1, arg2, arg3)
}

// ExecuteBatch mocks base method
func (m *MockImpl) ExecuteBatch(arg0 context.Context, arg1 *vtgate.Session, arg2 []string, arg3 []map[string]*query.BindVariable) (*vtgate.Session, []sqltypes.QueryResponse, error) {
	m.ctrl.T.Helper()
	ret := m.ctrl.Call(m, "ExecuteBatch", arg0, arg1, arg2, arg3)
	ret0, _ := ret[0].(*vtgate.Session)
	ret1, _ := ret[1].([]sqltypes.QueryResponse)
	ret2, _ := ret[2].(error)
	return ret0, ret1, ret2
}

// ExecuteBatch indicates an expected call of ExecuteBatch
func (mr *MockImplMockRecorder) ExecuteBatch(arg0, arg1, arg2, arg3 interface{}) *gomock.Call {
	mr.mock.ctrl.T.Helper()
	return mr.mock.ctrl.RecordCallWithMethodType(mr.mock, "ExecuteBatch", reflect.TypeOf((*MockImpl)(nil).ExecuteBatch), arg0, arg1, arg2, arg3)
}

// ExecuteBatchKeyspaceIds mocks base method
func (m *MockImpl) ExecuteBatchKeyspaceIds(arg0 context.Context, arg1 []*vtgate.BoundKeyspaceIdQuery, arg2 topodata.TabletType, arg3 bool, arg4 *vtgate.Session, arg5 *query.ExecuteOptions) (*vtgate.Session, []sqltypes.Result, error) {
	m.ctrl.T.Helper()
	ret := m.ctrl.Call(m, "ExecuteBatchKeyspaceIds", arg0, arg1, arg2, arg3, arg4, arg5)
	ret0, _ := ret[0].(*vtgate.Session)
	ret1, _ := ret[1].([]sqltypes.Result)
	ret2, _ := ret[2].(error)
	return ret0, ret1, ret2
}

// ExecuteBatchKeyspaceIds indicates an expected call of ExecuteBatchKeyspaceIds
func (mr *MockImplMockRecorder) ExecuteBatchKeyspaceIds(arg0, arg1, arg2, arg3, arg4, arg5 interface{}) *gomock.Call {
	mr.mock.ctrl.T.Helper()
	return mr.mock.ctrl.RecordCallWithMethodType(mr.mock, "ExecuteBatchKeyspaceIds", reflect.TypeOf((*MockImpl)(nil).ExecuteBatchKeyspaceIds), arg0, arg1, arg2, arg3, arg4, arg5)
}

// ExecuteBatchShards mocks base method
func (m *MockImpl) ExecuteBatchShards(arg0 context.Context, arg1 []*vtgate.BoundShardQuery, arg2 topodata.TabletType, arg3 bool, arg4 *vtgate.Session, arg5 *query.ExecuteOptions) (*vtgate.Session, []sqltypes.Result, error) {
	m.ctrl.T.Helper()
	ret := m.ctrl.Call(m, "ExecuteBatchShards", arg0, arg1, arg2, arg3, arg4, arg5)
	ret0, _ := ret[0].(*vtgate.Session)
	ret1, _ := ret[1].([]sqltypes.Result)
	ret2, _ := ret[2].(error)
	return ret0, ret1, ret2
}

// ExecuteBatchShards indicates an expected call of ExecuteBatchShards
func (mr *MockImplMockRecorder) ExecuteBatchShards(arg0, arg1, arg2, arg3, arg4, arg5 interface{}) *gomock.Call {
	mr.mock.ctrl.T.Helper()
	return mr.mock.ctrl.RecordCallWithMethodType(mr.mock, "ExecuteBatchShards", reflect.TypeOf((*MockImpl)(nil).ExecuteBatchShards), arg0, arg1, arg2, arg3, arg4, arg5)
}

// ExecuteEntityIds mocks base method
func (m *MockImpl) ExecuteEntityIds(arg0 context.Context, arg1, arg2, arg3 string, arg4 []*vtgate.ExecuteEntityIdsRequest_EntityId, arg5 map[string]*query.BindVariable, arg6 topodata.TabletType, arg7 *vtgate.Session, arg8 *query.ExecuteOptions) (*vtgate.Session, *sqltypes.Result, error) {
	m.ctrl.T.Helper()
	ret := m.ctrl.Call(m, "ExecuteEntityIds", arg0, arg1, arg2, arg3, arg4, arg5, arg6, arg7, arg8)
	ret0, _ := ret[0].(*vtgate.Session)
	ret1, _ := ret[1].(*sqltypes.Result)
	ret2, _ := ret[2].(error)
	return ret0, ret1, ret2
}

// ExecuteEntityIds indicates an expected call of ExecuteEntityIds
func (mr *MockImplMockRecorder) ExecuteEntityIds(arg0, arg1, arg2, arg3, arg4, arg5, arg6, arg7, arg8 interface{}) *gomock.Call {
	mr.mock.ctrl.T.Helper()
	return mr.mock.ctrl.RecordCallWithMethodType(mr.mock, "ExecuteEntityIds", reflect.TypeOf((*MockImpl)(nil).ExecuteEntityIds), arg0, arg1, arg2, arg3, arg4, arg5, arg6, arg7, arg8)
}

// ExecuteKeyRanges mocks base method
func (m *MockImpl) ExecuteKeyRanges(arg0 context.Context, arg1, arg2 string, arg3 []*topodata.KeyRange, arg4 map[string]*query.BindVariable, arg5 topodata.TabletType, arg6 *vtgate.Session, arg7 *query.ExecuteOptions) (*vtgate.Session, *sqltypes.Result, error) {
	m.ctrl.T.Helper()
	ret := m.ctrl.Call(m, "ExecuteKeyRanges", arg0, arg1, arg2, arg3, arg4, arg5, arg6, arg7)
	ret0, _ := ret[0].(*vtgate.Session)
	ret1, _ := ret[1].(*sqltypes.Result)
	ret2, _ := ret[2].(error)
	return ret0, ret1, ret2
}

// ExecuteKeyRanges indicates an expected call of ExecuteKeyRanges
func (mr *MockImplMockRecorder) ExecuteKeyRanges(arg0, arg1, arg2, arg3, arg4, arg5, arg6, arg7 interface{}) *gomock.Call {
	mr.mock.ctrl.T.Helper()
	return mr.mock.ctrl.RecordCallWithMethodType(mr.mock, "ExecuteKeyRanges", reflect.TypeOf((*MockImpl)(nil).ExecuteKeyRanges), arg0, arg1, arg2, arg3, arg4, arg5, arg6, arg7)
}

// ExecuteKeyspaceIds mocks base method
func (m *MockImpl) ExecuteKeyspaceIds(arg0 context.Context, arg1, arg2 string, arg3 [][]byte, arg4 map[string]*query.BindVariable, arg5 topodata.TabletType, arg6 *vtgate.Session, arg7 *query.ExecuteOptions) (*vtgate.Session, *sqltypes.Result, error) {
	m.ctrl.T.Helper()
	ret := m.ctrl.Call(m, "ExecuteKeyspaceIds", arg0, arg1, arg2, arg3, arg4, arg5, arg6, arg7)
	ret0, _ := ret[0].(*vtgate.Session)
	ret1, _ := ret[1].(*sqltypes.Result)
	ret2, _ := ret[2].(error)
	return ret0, ret1, ret2
}

// ExecuteKeyspaceIds indicates an expected call of ExecuteKeyspaceIds
func (mr *MockImplMockRecorder) ExecuteKeyspaceIds(arg0, arg1, arg2, arg3, arg4, arg5, arg6, arg7 interface{}) *gomock.Call {
	mr.mock.ctrl.T.Helper()
	return mr.mock.ctrl.RecordCallWithMethodType(mr.mock, "ExecuteKeyspaceIds", reflect.TypeOf((*MockImpl)(nil).ExecuteKeyspaceIds), arg0, arg1, arg2, arg3, arg4, arg5, arg6, arg7)
}

// ExecuteShards mocks base method
func (m *MockImpl) ExecuteShards(arg0 context.Context, arg1, arg2 string, arg3 []string, arg4 map[string]*query.BindVariable, arg5 topodata.TabletType, arg6 *vtgate.Session, arg7 *query.ExecuteOptions) (*vtgate.Session, *sqltypes.Result, error) {
	m.ctrl.T.Helper()
	ret := m.ctrl.Call(m, "ExecuteShards", arg0, arg1, arg2, arg3, arg4, arg5, arg6, arg7)
	ret0, _ := ret[0].(*vtgate.Session)
	ret1, _ := ret[1].(*sqltypes.Result)
	ret2, _ := ret[2].(error)
	return ret0, ret1, ret2
}

// ExecuteShards indicates an expected call of ExecuteShards
func (mr *MockImplMockRecorder) ExecuteShards(arg0, arg1, arg2, arg3, arg4, arg5, arg6, arg7 interface{}) *gomock.Call {
	mr.mock.ctrl.T.Helper()
	return mr.mock.ctrl.RecordCallWithMethodType(mr.mock, "ExecuteShards", reflect.TypeOf((*MockImpl)(nil).ExecuteShards), arg0, arg1, arg2, arg3, arg4, arg5, arg6, arg7)
}

// GetSrvKeyspace mocks base method
func (m *MockImpl) GetSrvKeyspace(arg0 context.Context, arg1 string) (*topodata.SrvKeyspace, error) {
	m.ctrl.T.Helper()
	ret := m.ctrl.Call(m, "GetSrvKeyspace", arg0, arg1)
	ret0, _ := ret[0].(*topodata.SrvKeyspace)
	ret1, _ := ret[1].(error)
	return ret0, ret1
}

// GetSrvKeyspace indicates an expected call of GetSrvKeyspace
func (mr *MockImplMockRecorder) GetSrvKeyspace(arg0, arg1 interface{}) *gomock.Call {
	mr.mock.ctrl.T.Helper()
	return mr.mock.ctrl.RecordCallWithMethodType(mr.mock, "GetSrvKeyspace", reflect.TypeOf((*MockImpl)(nil).GetSrvKeyspace), arg0, arg1)
}

// MessageAck mocks base method
func (m *MockImpl) MessageAck(arg0 context.Context, arg1, arg2 string, arg3 []*query.Value) (int64, error) {
	m.ctrl.T.Helper()
	ret := m.ctrl.Call(m, "MessageAck", arg0, arg1, arg2, arg3)
	ret0, _ := ret[0].(int64)
	ret1, _ := ret[1].(error)
	return ret0, ret1
}

// MessageAck indicates an expected call of MessageAck
func (mr *MockImplMockRecorder) MessageAck(arg0, arg1, arg2, arg3 interface{}) *gomock.Call {
	mr.mock.ctrl.T.Helper()
	return mr.mock.ctrl.RecordCallWithMethodType(mr.mock, "MessageAck", reflect.TypeOf((*MockImpl)(nil).MessageAck), arg0, arg1, arg2, arg3)
}

// MessageAckKeyspaceIds mocks base method
func (m *MockImpl) MessageAckKeyspaceIds(arg0 context.Context, arg1, arg2 string, arg3 []*vtgate.IdKeyspaceId) (int64, error) {
	m.ctrl.T.Helper()
	ret := m.ctrl.Call(m, "MessageAckKeyspaceIds", arg0, arg1, arg2, arg3)
	ret0, _ := ret[0].(int64)
	ret1, _ := ret[1].(error)
	return ret0, ret1
}

// MessageAckKeyspaceIds indicates an expected call of MessageAckKeyspaceIds
func (mr *MockImplMockRecorder) MessageAckKeyspaceIds(arg0, arg1, arg2, arg3 interface{}) *gomock.Call {
	mr.mock.ctrl.T.Helper()
	return mr.mock.ctrl.RecordCallWithMethodType(mr.mock, "MessageAckKeyspaceIds", reflect.TypeOf((*MockImpl)(nil).MessageAckKeyspaceIds), arg0, arg1, arg2, arg3)
}

// MessageStream mocks base method
func (m *MockImpl) MessageStream(arg0 context.Context, arg1, arg2 string, arg3 *topodata.KeyRange, arg4 string, arg5 func(*sqltypes.Result) error) error {
	m.ctrl.T.Helper()
	ret := m.ctrl.Call(m, "MessageStream", arg0, arg1, arg2, arg3, arg4, arg5)
	ret0, _ := ret[0].(error)
	return ret0
}

// MessageStream indicates an expected call of MessageStream
func (mr *MockImplMockRecorder) MessageStream(arg0, arg1, arg2, arg3, arg4, arg5 interface{}) *gomock.Call {
	mr.mock.ctrl.T.Helper()
	return mr.mock.ctrl.RecordCallWithMethodType(mr.mock, "MessageStream", reflect.TypeOf((*MockImpl)(nil).MessageStream), arg0, arg1, arg2, arg3, arg4, arg5)
}

// ResolveTransaction mocks base method
func (m *MockImpl) ResolveTransaction(arg0 context.Context, arg1 string) error {
	m.ctrl.T.Helper()
	ret := m.ctrl.Call(m, "ResolveTransaction", arg0, arg1)
	ret0, _ := ret[0].(error)
	return ret0
}

// ResolveTransaction indicates an expected call of ResolveTransaction
func (mr *MockImplMockRecorder) ResolveTransaction(arg0, arg1 interface{}) *gomock.Call {
	mr.mock.ctrl.T.Helper()
	return mr.mock.ctrl.RecordCallWithMethodType(mr.mock, "ResolveTransaction", reflect.TypeOf((*MockImpl)(nil).ResolveTransaction), arg0, arg1)
}

// Rollback mocks base method
func (m *MockImpl) Rollback(arg0 context.Context, arg1 *vtgate.Session) error {
	m.ctrl.T.Helper()
	ret := m.ctrl.Call(m, "Rollback", arg0, arg1)
	ret0, _ := ret[0].(error)
	return ret0
}

// Rollback indicates an expected call of Rollback
func (mr *MockImplMockRecorder) Rollback(arg0, arg1 interface{}) *gomock.Call {
	mr.mock.ctrl.T.Helper()
	return mr.mock.ctrl.RecordCallWithMethodType(mr.mock, "Rollback", reflect.TypeOf((*MockImpl)(nil).Rollback), arg0, arg1)
}

// SplitQuery mocks base method
func (m *MockImpl) SplitQuery(arg0 context.Context, arg1, arg2 string, arg3 map[string]*query.BindVariable, arg4 []string, arg5, arg6 int64, arg7 query.SplitQueryRequest_Algorithm) ([]*vtgate.SplitQueryResponse_Part, error) {
	m.ctrl.T.Helper()
	ret := m.ctrl.Call(m, "SplitQuery", arg0, arg1, arg2, arg3, arg4, arg5, arg6, arg7)
	ret0, _ := ret[0].([]*vtgate.SplitQueryResponse_Part)
	ret1, _ := ret[1].(error)
	return ret0, ret1
}

// SplitQuery indicates an expected call of SplitQuery
func (mr *MockImplMockRecorder) SplitQuery(arg0, arg1, arg2, arg3, arg4, arg5, arg6, arg7 interface{}) *gomock.Call {
	mr.mock.ctrl.T.Helper()
	return mr.mock.ctrl.RecordCallWithMethodType(mr.mock, "SplitQuery", reflect.TypeOf((*MockImpl)(nil).SplitQuery), arg0, arg1, arg2, arg3, arg4, arg5, arg6, arg7)
}

// StreamExecute mocks base method
func (m *MockImpl) StreamExecute(arg0 context.Context, arg1 *vtgate.Session, arg2 string, arg3 map[string]*query.BindVariable) (sqltypes.ResultStream, error) {
	m.ctrl.T.Helper()
	ret := m.ctrl.Call(m, "StreamExecute", arg0, arg1, arg2, arg3)
	ret0, _ := ret[0].(sqltypes.ResultStream)
	ret1, _ := ret[1].(error)
	return ret0, ret1
}

// StreamExecute indicates an expected call of StreamExecute
func (mr *MockImplMockRecorder) StreamExecute(arg0, arg1, arg2, arg3 interface{}) *gomock.Call {
	mr.mock.ctrl.T.Helper()
	return mr.mock.ctrl.RecordCallWithMethodType(mr.mock, "StreamExecute", reflect.TypeOf((*MockImpl)(nil).StreamExecute), arg0, arg1, arg2, arg3)
}

// StreamExecuteKeyRanges mocks base method
func (m *MockImpl) StreamExecuteKeyRanges(arg0 context.Context, arg1, arg2 string, arg3 []*topodata.KeyRange, arg4 map[string]*query.BindVariable, arg5 topodata.TabletType, arg6 *query.ExecuteOptions) (sqltypes.ResultStream, error) {
	m.ctrl.T.Helper()
	ret := m.ctrl.Call(m, "StreamExecuteKeyRanges", arg0, arg1, arg2, arg3, arg4, arg5, arg6)
	ret0, _ := ret[0].(sqltypes.ResultStream)
	ret1, _ := ret[1].(error)
	return ret0, ret1
}

// StreamExecuteKeyRanges indicates an expected call of StreamExecuteKeyRanges
func (mr *MockImplMockRecorder) StreamExecuteKeyRanges(arg0, arg1, arg2, arg3, arg4, arg5, arg6 interface{}) *gomock.Call {
	mr.mock.ctrl.T.Helper()
	return mr.mock.ctrl.RecordCallWithMethodType(mr.mock, "StreamExecuteKeyRanges", reflect.TypeOf((*MockImpl)(nil).StreamExecuteKeyRanges), arg0, arg1, arg2, arg3, arg4, arg5, arg6)
}

// StreamExecuteKeyspaceIds mocks base method
func (m *MockImpl) StreamExecuteKeyspaceIds(arg0 context.Context, arg1, arg2 string, arg3 [][]byte, arg4 map[string]*query.BindVariable, arg5 topodata.TabletType, arg6 *query.ExecuteOptions) (sqltypes.ResultStream, error) {
	m.ctrl.T.Helper()
	ret := m.ctrl.Call(m, "StreamExecuteKeyspaceIds", arg0, arg1, arg2, arg3, arg4, arg5, arg6)
	ret0, _ := ret[0].(sqltypes.ResultStream)
	ret1, _ := ret[1].(error)
	return ret0, ret1
}

// StreamExecuteKeyspaceIds indicates an expected call of StreamExecuteKeyspaceIds
func (mr *MockImplMockRecorder) StreamExecuteKeyspaceIds(arg0, arg1, arg2, arg3, arg4, arg5, arg6 interface{}) *gomock.Call {
	mr.mock.ctrl.T.Helper()
	return mr.mock.ctrl.RecordCallWithMethodType(mr.mock, "StreamExecuteKeyspaceIds", reflect.TypeOf((*MockImpl)(nil).StreamExecuteKeyspaceIds), arg0, arg1, arg2, arg3, arg4, arg5, arg6)
}

// StreamExecuteShards mocks base method
func (m *MockImpl) StreamExecuteShards(arg0 context.Context, arg1, arg2 string, arg3 []string, arg4 map[string]*query.BindVariable, arg5 topodata.TabletType, arg6 *query.ExecuteOptions) (sqltypes.ResultStream, error) {
	m.ctrl.T.Helper()
	ret := m.ctrl.Call(m, "StreamExecuteShards", arg0, arg1, arg2, arg3, arg4, arg5, arg6)
	ret0, _ := ret[0].(sqltypes.ResultStream)
	ret1, _ := ret[1].(error)
	return ret0, ret1
}

// StreamExecuteShards indicates an expected call of StreamExecuteShards
func (mr *MockImplMockRecorder) StreamExecuteShards(arg0, arg1, arg2, arg3, arg4, arg5, arg6 interface{}) *gomock.Call {
	mr.mock.ctrl.T.Helper()
	return mr.mock.ctrl.RecordCallWithMethodType(mr.mock, "StreamExecuteShards", reflect.TypeOf((*MockImpl)(nil).StreamExecuteShards), arg0, arg1, arg2, arg3, arg4, arg5, arg6)
}

// UpdateStream mocks base method
func (m *MockImpl) UpdateStream(arg0 context.Context, arg1, arg2 string, arg3 *topodata.KeyRange, arg4 topodata.TabletType, arg5 int64, arg6 *query.EventToken) (UpdateStreamReader, error) {
	m.ctrl.T.Helper()
	ret := m.ctrl.Call(m, "UpdateStream", arg0, arg1, arg2, arg3, arg4, arg5, arg6)
	ret0, _ := ret[0].(UpdateStreamReader)
	ret1, _ := ret[1].(error)
	return ret0, ret1
}

// UpdateStream indicates an expected call of UpdateStream
func (mr *MockImplMockRecorder) UpdateStream(arg0, arg1, arg2, arg3, arg4, arg5, arg6 interface{}) *gomock.Call {
	mr.mock.ctrl.T.Helper()
	return mr.mock.ctrl.RecordCallWithMethodType(mr.mock, "UpdateStream", reflect.TypeOf((*MockImpl)(nil).UpdateStream), arg0, arg1, arg2, arg3, arg4, arg5, arg6)
}

// VStream mocks base method
func (m *MockImpl) VStream(arg0 context.Context, arg1 topodata.TabletType, arg2 *binlogdata.VGtid, arg3 *binlogdata.Filter) (VStreamReader, error) {
	m.ctrl.T.Helper()
	ret := m.ctrl.Call(m, "VStream", arg0, arg1, arg2, arg3)
	ret0, _ := ret[0].(VStreamReader)
	ret1, _ := ret[1].(error)
	return ret0, ret1
}

// VStream indicates an expected call of VStream
func (mr *MockImplMockRecorder) VStream(arg0, arg1, arg2, arg3 interface{}) *gomock.Call {
	mr.mock.ctrl.T.Helper()
	return mr.mock.ctrl.RecordCallWithMethodType(mr.mock, "VStream", reflect.TypeOf((*MockImpl)(nil).VStream), arg0, arg1, arg2, arg3)
}
