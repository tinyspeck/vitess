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
package vtctldclient

import (
	"context"
	"testing"

	"github.com/stretchr/testify/require"
	"golang.org/x/net/nettest"
	"google.golang.org/grpc"
	vtadminpb "vitess.io/vitess/go/vt/proto/vtadmin"
	vtctlservicepb "vitess.io/vitess/go/vt/proto/vtctlservice"
	"vitess.io/vitess/go/vt/vtadmin/cluster/discovery/fakediscovery"
)

type fakeVtctld struct {
	vtctlservicepb.VtctlServer
}

func TestVtctldClientProxy(t *testing.T) {
	// See WithTestServer
	lis, err := nettest.NewLocalListener("tcp")
	require.NoError(t, err, "cannot create local listener")

	defer lis.Close()

	server := &fakeVtctld{}

	s := grpc.NewServer()
	vtctlservicepb.RegisterVtctlServer(s, server)

	go s.Serve(lis)
	defer s.Stop()

	vtctlds := []*vtadminpb.Vtctld{
		{
			Hostname: lis.Addr().String(),
		},
	}

	disco := fakediscovery.New()
	disco.AddTaggedVtctlds(nil, vtctlds...)

	config := &Config{
		Cluster: &vtadminpb.Cluster{
			Name: "testcluster",
		},
		Discovery: disco,
	}

	proxy := New(config)

	ctx := context.Background()
	proxy.Dial(ctx)
}
