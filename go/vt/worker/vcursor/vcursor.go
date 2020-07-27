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

package vcursor

import (
	"fmt"

	"golang.org/x/net/context"

	"vitess.io/vitess/go/sqltypes"
	querypb "vitess.io/vitess/go/vt/proto/query"
	vtgatepb "vitess.io/vitess/go/vt/proto/vtgate"

	"vitess.io/vitess/go/vt/vtgate/vindexes"
	"vitess.io/vitess/go/vt/vtgate/vtgateconn"
)

// CleanupFunc provides a way for clients to cleanup resources associated with VCursors
type CleanupFunc func()

// NewVCursor returns stuff.
func NewVCursor(
	ctx context.Context,
	hostPortString, targetString string,
) (vindexes.VCursor, CleanupFunc, error) {
	vtgateConn, err := vtgateconn.Dial(ctx, hostPortString)
	if err != nil {
		return nil, nil, err
	}

	session := vtgateConn.Session(targetString, &querypb.ExecuteOptions{})
	cleanup := func() {
		vtgateConn.Close()
	}
	return &workerVCursorImpl{context: ctx, session: session}, cleanup, nil
}

type workerVCursorImpl struct {
	// Normally, we don't want to store a context.Context but we're doing it here
	// since we know that we want to attach ourselves to the root context.Context
	// created in a worker run
	context context.Context

	session *vtgateconn.VTGateSession
}

// implements vtgate.vindexes.VCursor#Execute
func (wvci *workerVCursorImpl) Execute(
	method string,
	query string,
	bindVars map[string]*querypb.BindVariable,
	isDML bool,
	co vtgatepb.CommitOrder,
) (*sqltypes.Result, error) {
	return wvci.session.Execute(wvci.context, query, bindVars)
}

// implements vtgate.vindexes.VCursor#ExecuteKeyspaceID
func (wvci *workerVCursorImpl) ExecuteKeyspaceID(
	keyspace string,
	_ []byte,
	_ string,
	_ map[string]*querypb.BindVariable,
	_, _ bool,
) (*sqltypes.Result, error) {
	return nil, fmt.Errorf("Unexpected call to `ExecuteKeyspaceId` for keyspace %s", keyspace)
}
