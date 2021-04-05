/*
Copyright 2021 The Vitess Authors.

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

// Package testutil contains utility functions for writing tests for the
// grpcvtctldserver.
package testutil

import (
	"context"
	"testing"

	"github.com/stretchr/testify/require"
	"golang.org/x/net/nettest"
	"google.golang.org/grpc"

	"vitess.io/vitess/go/vt/topo"
	"vitess.io/vitess/go/vt/vtctl/vtctldclient"

	vtctldatapb "vitess.io/vitess/go/vt/proto/vtctldata"
	vtctlservicepb "vitess.io/vitess/go/vt/proto/vtctlservice"
)

// WithTestServer creates a gRPC server listening locally with the given RPC
// implementation, then runs the test func with a client created to point at
// that server.
func WithTestServer(
	t *testing.T,
	server vtctlservicepb.VtctldServer,
	test func(t *testing.T, client vtctldclient.VtctldClient),
) {
	lis, err := nettest.NewLocalListener("tcp")
	require.NoError(t, err, "cannot create local listener")

	defer lis.Close()

	s := grpc.NewServer()
	vtctlservicepb.RegisterVtctldServer(s, server)

	go s.Serve(lis)
	defer s.Stop()

	client, err := vtctldclient.New("grpc", lis.Addr().String())
	require.NoError(t, err, "cannot create vtctld client")

	test(t, client)
}

// AddKeyspace adds a keyspace to a topology, failing a test if that keyspace
// could not be added. It shallow copies the proto struct to prevent XXX_ fields
// from changing in the marshalling.
func AddKeyspace(ctx context.Context, t *testing.T, ts *topo.Server, ks *vtctldatapb.Keyspace) {
	in := *ks.Keyspace // take a copy to avoid XXX_ fields changing.

	err := ts.CreateKeyspace(ctx, ks.Name, &in)
	require.NoError(t, err)
}
