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

func initFakeVtctld() (net.Listener, *grpc.Server, error) {
	// See WithTestServer
	lis, err := nettest.NewLocalListener("tcp")
	if err != nil {
		return nil, nil, err
	}

	server := &fakeVtctld{}

	s := grpc.NewServer()
	vtctlservicepb.RegisterVtctlServer(s, server)

	go s.Serve(lis)

	return lis, s, nil
}

func TestVtctldClientProxy(t *testing.T) {
	vtctld1, s1, err := initFakeVtctld()
	defer vtctld1.Close()
	defer s1.Stop()
	require.NoError(t, err, "cannot create local listener")
	t.Logf("vtctld1: %s\n", vtctld1.Addr().String())

	vtctld2, s2, err := initFakeVtctld()
	defer vtctld2.Close()
	defer s2.Stop()
	require.NoError(t, err, "cannot create local listener")
	t.Logf("vtctld2: %s\n", vtctld2.Addr().String())

	vtctlds := []*vtadminpb.Vtctld{
		{
			Hostname: vtctld1.Addr().String(),
		},
		{
			Hostname: vtctld2.Addr().String(),
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

	// We don't have a host until we call Dial
	require.Empty(t, proxy.host)

	ctx, cancel := context.WithTimeout(context.Background(), 1*time.Second)
	defer cancel()

	err = proxy.Dial(ctx)
	require.NoError(t, err)
	assert.Equal(t, vtctld1.Addr().String(), proxy.host)

	// Stop vtctld1 so we switch over to vtctld2
	s1.Stop()

	err = proxy.Dial(ctx)
	require.NoError(t, err)
	assert.Equal(t, vtctld2.Addr().String(), proxy.host)

	// s2.Stop()
}
