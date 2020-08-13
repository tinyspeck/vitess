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

package vcursor

import (
	"flag"
	"fmt"
	"strings"

	"golang.org/x/net/context"

	"vitess.io/vitess/go/sqltypes"
	querypb "vitess.io/vitess/go/vt/proto/query"
	vtgatepb "vitess.io/vitess/go/vt/proto/vtgate"

	"vitess.io/vitess/go/vt/vtgate/vindexes"
	"vitess.io/vitess/go/vt/vtgate/vtgateconn"
)

const (
	serverAddrFlagName   = "vcursor_server_addr"
	targetStringFlagName = "vcursor_target"
)

// CleanupFunc provides a way for clients to cleanup resources associated with VCursors
type CleanupFunc func()

// Args are the VCursor args we expect in a flag.FlagSet ad
type Args struct {
	serverAddr, targetString *string
}

// NewArgs returns an Args struct that will contain values for the command line flags
// needed to construct a VCursor
func NewArgs(subFlags *flag.FlagSet) Args {
	return Args{
		serverAddr: subFlags.String(
			serverAddrFlagName,
			"",
			"[Required] vcursor host and grpc port of the form $host:$port",
		),
		targetString: subFlags.String(
			targetStringFlagName,
			"mainteam@REPLICA",
			"vcursor keyspace/tablet type to use for vindex lookups",
		),
	}
}

// Validate validates values within Args
func (a Args) Validate() error {
	if a.serverAddr == nil {
		return fmt.Errorf("%s is nil", serverAddrFlagName)
	}
	if a.targetString == nil {
		return fmt.Errorf("%s is nil", targetStringFlagName)
	}

	if *a.serverAddr == "" {
		return fmt.Errorf("%s required when merging shards", serverAddrFlagName)
	}

	if len(strings.Split(*a.serverAddr, ":")) != 2 {
		return fmt.Errorf("Invalid %s: %s", serverAddrFlagName, *a.serverAddr)
	}

	return nil
}

// ServerAddr returns the target host/port for a vcursor
func (a Args) ServerAddr() string {
	if a.serverAddr == nil {
		return ""
	}

	return *a.serverAddr
}

// TargetString returns the keyspace/tablet_type pair for a vcursor
func (a Args) TargetString() string {
	if a.targetString == nil {
		return ""
	}

	return *a.targetString
}

// NewVCursor returns a vindexes.VCursor implementation backed by a grpc vtgateconn, as
// well as a CleanupFunc that is used to release any resources related to this connection
// once its no longer needed.
func NewVCursor(ctx context.Context, args Args) (vindexes.VCursor, CleanupFunc, error) {
	vtgateConn, err := vtgateconn.Dial(ctx, args.ServerAddr())
	if err != nil {
		return nil, nil, err
	}

	session := vtgateConn.Session(args.TargetString(), &querypb.ExecuteOptions{})
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
