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
	"net"
	"testing"
	"time"

	"github.com/stretchr/testify/assert"
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

// initFakeVtctld starts a fakeVtctld gRPC server that listens on a random port.
// Callers are responsible for calling both vtctld.Close() and s.Stop()
func initFakeVtctld() (net.Listener, *grpc.Server, error) {
	vtctld, err := nettest.NewLocalListener("tcp")
	if err != nil {
		return nil, nil, err
	}

	server := &fakeVtctld{}

	s := grpc.NewServer()
	vtctlservicepb.RegisterVtctlServer(s, server)

	go s.Serve(vtctld)

	return vtctld, s, nil
}

// TestDial_Rediscovery tests that the Dial function can dial and connect to
// an alternate vtctld when the vtctld it is initially connected to becomes unavailable.
func TestDial_Rediscovery(t *testing.T) {
	vtctld0, s0, err := initFakeVtctld()
	require.NoError(t, err, "cannot create local listener")
	defer vtctld0.Close()
	defer s0.Stop()

	vtctld1, s1, err := initFakeVtctld()
	require.NoError(t, err, "cannot create local listener")
	defer vtctld1.Close()
	defer s1.Stop()

	disco := fakediscovery.New()
	disco.AddTaggedVtctlds(nil, []*vtadminpb.Vtctld{
		{
			Hostname: vtctld0.Addr().String(),
		},
		{
			Hostname: vtctld1.Addr().String(),
		},
	}...)

	proxy := New(&Config{
		Cluster: &vtadminpb.Cluster{
			Id:   "test",
			Name: "testcluster",
		},
		Discovery: disco,
	})

	// We don't have a vtctld host until we call Dial
	require.Empty(t, proxy.host)

	ctx, cancel := context.WithTimeout(context.Background(), 1*time.Second)
	defer cancel()

	err = proxy.Dial(ctx)
	require.NoError(t, err)

	nextHost := ""

	// TODO remove vtctld from discovery for tests to pass
	// (but also consider adding retries to dial...? that's complicated though)
	switch proxy.host {
	case vtctld0.Addr().String():
		vtctld0.Close()
		nextHost = vtctld1.Addr().String()
	case vtctld1.Addr().String():
		vtctld1.Close()
		nextHost = vtctld0.Addr().String()
	default:
		t.Fatalf("Initial vtctld hostname invalid: %s", proxy.host)
	}

	disco.RemoveVtctld(proxy.host)

	err = proxy.Dial(ctx)
	require.NoError(t, err)

	assert.Equal(t, nextHost, proxy.host)
}
