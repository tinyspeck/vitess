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

package grpcvtctldserver

import (
	"context"
	"errors"
	"testing"
	"time"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"

	"vitess.io/vitess/go/vt/logutil"
	"vitess.io/vitess/go/vt/topo"
	"vitess.io/vitess/go/vt/topo/memorytopo"
	"vitess.io/vitess/go/vt/vtctl/grpcvtctldserver/testutil"

	topodatapb "vitess.io/vitess/go/vt/proto/topodata"
	vtctldatapb "vitess.io/vitess/go/vt/proto/vtctldata"
)

func TestFindAllShardsInKeyspace(t *testing.T) {
	ctx := context.Background()
	ts := memorytopo.NewServer("cell1")
	vtctld := NewVtctldServer(ts)

	ks := &vtctldatapb.Keyspace{
		Name:     "testkeyspace",
		Keyspace: &topodatapb.Keyspace{},
	}
	addKeyspace(ctx, t, ts, ks)

	si1, err := ts.GetOrCreateShard(ctx, ks.Name, "-80")
	require.NoError(t, err)
	si2, err := ts.GetOrCreateShard(ctx, ks.Name, "80-")
	require.NoError(t, err)

	resp, err := vtctld.FindAllShardsInKeyspace(ctx, &vtctldatapb.FindAllShardsInKeyspaceRequest{Keyspace: ks.Name})
	assert.NoError(t, err)
	assert.NotNil(t, resp)

	expected := map[string]*vtctldatapb.Shard{
		"-80": {
			Keyspace: ks.Name,
			Name:     "-80",
			Shard:    si1.Shard,
		},
		"80-": {
			Keyspace: ks.Name,
			Name:     "80-",
			Shard:    si2.Shard,
		},
	}

	assert.Equal(t, expected, resp.Shards)

	_, err = vtctld.FindAllShardsInKeyspace(ctx, &vtctldatapb.FindAllShardsInKeyspaceRequest{Keyspace: "nothing"})
	assert.Error(t, err)
}

func TestGetKeyspace(t *testing.T) {
	ctx := context.Background()
	ts := memorytopo.NewServer("cell1")
	vtctld := NewVtctldServer(ts)

	expected := &vtctldatapb.GetKeyspaceResponse{
		Keyspace: &vtctldatapb.Keyspace{
			Name: "testkeyspace",
			Keyspace: &topodatapb.Keyspace{
				ShardingColumnName: "col1",
			},
		},
	}
	addKeyspace(ctx, t, ts, expected.Keyspace)

	ks, err := vtctld.GetKeyspace(ctx, &vtctldatapb.GetKeyspaceRequest{Keyspace: expected.Keyspace.Name})
	assert.NoError(t, err)
	assert.Equal(t, expected, ks)

	_, err = vtctld.GetKeyspace(ctx, &vtctldatapb.GetKeyspaceRequest{Keyspace: "notfound"})
	assert.Error(t, err)
}

func addKeyspace(ctx context.Context, t *testing.T, ts *topo.Server, ks *vtctldatapb.Keyspace) {
	in := *ks.Keyspace // take a copy to avoid the XXX_ fields changing

	err := ts.CreateKeyspace(ctx, ks.Name, &in)
	require.NoError(t, err)
}

func TestGetKeyspaces(t *testing.T) {
	ctx := context.Background()
	ts, topofactory := memorytopo.NewServerAndFactory("cell1")
	vtctld := NewVtctldServer(ts)

	resp, err := vtctld.GetKeyspaces(ctx, &vtctldatapb.GetKeyspacesRequest{})
	assert.NoError(t, err)
	assert.Empty(t, resp.Keyspaces)

	expected := []*vtctldatapb.Keyspace{
		{
			Name: "ks1",
			Keyspace: &topodatapb.Keyspace{
				ShardingColumnName: "ks1_col1",
			},
		},
		{
			Name: "ks2",
			Keyspace: &topodatapb.Keyspace{
				ShardingColumnName: "ks2_col1",
			},
		},
		{
			Name: "ks3",
			Keyspace: &topodatapb.Keyspace{
				ShardingColumnName: "ks3_col1",
			},
		},
	}
	for _, ks := range expected {
		addKeyspace(ctx, t, ts, ks)
	}

	resp, err = vtctld.GetKeyspaces(ctx, &vtctldatapb.GetKeyspacesRequest{})
	assert.NoError(t, err)
	assert.Equal(t, expected, resp.Keyspaces)

	topofactory.SetError(errors.New("error from toposerver"))

	_, err = vtctld.GetKeyspaces(ctx, &vtctldatapb.GetKeyspacesRequest{})
	assert.Error(t, err)
}

func TestGetTablet(t *testing.T) {
	ctx := context.Background()
	ts := memorytopo.NewServer("cell1")
	vtctld := NewVtctldServer(ts)

	tablet := &topodatapb.Tablet{
		Alias: &topodatapb.TabletAlias{
			Cell: "cell1",
			Uid:  100,
		},
		Hostname: "localhost",
		Keyspace: "testkeyspace",
		Shard:    "-",
		Type:     topodatapb.TabletType_REPLICA,
	}

	testutil.AddTablet(ctx, t, ts, tablet)

	resp, err := vtctld.GetTablet(ctx, &vtctldatapb.GetTabletRequest{
		TabletAlias: &topodatapb.TabletAlias{
			Cell: "cell1",
			Uid:  100,
		},
	})
	assert.NoError(t, err)
	assert.Equal(t, resp.Tablet, tablet)

	// not found
	_, err = vtctld.GetTablet(ctx, &vtctldatapb.GetTabletRequest{
		TabletAlias: &topodatapb.TabletAlias{
			Cell: "cell1",
			Uid:  101,
		},
	})
	assert.Error(t, err)
}

func TestGetTablets(t *testing.T) {
	tests := []struct {
		name      string
		cells     []string
		tablets   []*topodatapb.Tablet
		req       *vtctldatapb.GetTabletsRequest
		expected  []*topodatapb.Tablet
		shouldErr bool
	}{
		{
			name:      "no tablets",
			cells:     []string{"cell1"},
			tablets:   []*topodatapb.Tablet{},
			req:       &vtctldatapb.GetTabletsRequest{},
			expected:  []*topodatapb.Tablet{},
			shouldErr: false,
		},
		{
			name:  "keyspace and shard filter",
			cells: []string{"cell1"},
			tablets: []*topodatapb.Tablet{
				{
					Alias: &topodatapb.TabletAlias{
						Cell: "cell1",
						Uid:  100,
					},
					Keyspace: "ks1",
					Shard:    "-80",
				},
				{
					Alias: &topodatapb.TabletAlias{
						Cell: "cell1",
						Uid:  101,
					},
					Keyspace: "ks1",
					Shard:    "80-",
				},
				{
					Alias: &topodatapb.TabletAlias{
						Cell: "cell1",
						Uid:  102,
					},
					Keyspace: "ks2",
					Shard:    "-",
				},
			},
			req: &vtctldatapb.GetTabletsRequest{
				Keyspace: "ks1",
				Shard:    "80-",
			},
			expected: []*topodatapb.Tablet{
				{
					Alias: &topodatapb.TabletAlias{
						Cell: "cell1",
						Uid:  101,
					},
					Keyspace: "ks1",
					Shard:    "80-",
				},
			},
			shouldErr: false,
		},
		{
			name:  "keyspace filter",
			cells: []string{"cell1"},
			tablets: []*topodatapb.Tablet{
				{
					Alias: &topodatapb.TabletAlias{
						Cell: "cell1",
						Uid:  100,
					},
					Keyspace: "ks1",
				},
				{
					Alias: &topodatapb.TabletAlias{
						Cell: "cell1",
						Uid:  101,
					},
					Keyspace: "ks1",
				},
				{
					Alias: &topodatapb.TabletAlias{
						Cell: "cell1",
						Uid:  102,
					},
					Keyspace: "otherkeyspace",
				},
			},
			req: &vtctldatapb.GetTabletsRequest{
				Keyspace: "ks1",
			},
			expected: []*topodatapb.Tablet{
				{
					Alias: &topodatapb.TabletAlias{
						Cell: "cell1",
						Uid:  100,
					},
					Keyspace: "ks1",
				},
				{
					Alias: &topodatapb.TabletAlias{
						Cell: "cell1",
						Uid:  101,
					},
					Keyspace: "ks1",
				},
			},
			shouldErr: false,
		},
		{
			name:  "keyspace and shard filter - stale primary",
			cells: []string{"cell1"},
			tablets: []*topodatapb.Tablet{
				{
					Alias: &topodatapb.TabletAlias{
						Cell: "cell1",
						Uid:  100,
					},
					Keyspace: "ks1",
					Shard:    "-80",
				},
				{
					Alias: &topodatapb.TabletAlias{
						Cell: "cell1",
						Uid:  101,
					},
					Keyspace: "ks1",
					Shard:    "80-",
				},
				{
					Alias: &topodatapb.TabletAlias{
						Cell: "cell1",
						Uid:  102,
					},
					Keyspace:            "ks2",
					Shard:               "-",
					Type:                topodatapb.TabletType_MASTER,
					MasterTermStartTime: logutil.TimeToProto(time.Date(2006, time.January, 2, 15, 4, 5, 0, time.UTC)),
				},
				{
					Alias: &topodatapb.TabletAlias{
						Cell: "cell1",
						Uid:  103,
					},
					Keyspace:            "ks2",
					Shard:               "-",
					Hostname:            "stale.primary",
					Type:                topodatapb.TabletType_MASTER,
					MasterTermStartTime: logutil.TimeToProto(time.Date(2006, time.January, 2, 14, 4, 5, 0, time.UTC)),
				},
			},
			req: &vtctldatapb.GetTabletsRequest{
				Keyspace: "ks2",
				Shard:    "-",
			},
			expected: []*topodatapb.Tablet{
				{
					Alias: &topodatapb.TabletAlias{
						Cell: "cell1",
						Uid:  102,
					},
					Keyspace:            "ks2",
					Shard:               "-",
					Type:                topodatapb.TabletType_MASTER,
					MasterTermStartTime: logutil.TimeToProto(time.Date(2006, time.January, 2, 15, 4, 5, 0, time.UTC)),
				},
				{
					Alias: &topodatapb.TabletAlias{
						Cell: "cell1",
						Uid:  103,
					},
					Keyspace:            "ks2",
					Shard:               "-",
					Hostname:            "stale.primary",
					Type:                topodatapb.TabletType_UNKNOWN,
					MasterTermStartTime: logutil.TimeToProto(time.Date(2006, time.January, 2, 14, 4, 5, 0, time.UTC)),
				},
			},
			shouldErr: false,
		},
		{
			name:  "stale primary",
			cells: []string{"cell1"},
			tablets: []*topodatapb.Tablet{
				{
					Alias: &topodatapb.TabletAlias{
						Cell: "cell1",
						Uid:  100,
					},
					Keyspace:            "ks1",
					Shard:               "-",
					Hostname:            "slightly less stale",
					Type:                topodatapb.TabletType_MASTER,
					MasterTermStartTime: logutil.TimeToProto(time.Date(2006, time.January, 2, 15, 4, 5, 0, time.UTC)),
				},
				{
					Alias: &topodatapb.TabletAlias{
						Cell: "cell1",
						Uid:  101,
					},
					Hostname:            "stale primary",
					Keyspace:            "ks1",
					Shard:               "-",
					Type:                topodatapb.TabletType_MASTER,
					MasterTermStartTime: logutil.TimeToProto(time.Date(2006, time.January, 2, 14, 4, 5, 0, time.UTC)),
				},
				{
					Alias: &topodatapb.TabletAlias{
						Cell: "cell1",
						Uid:  103,
					},
					Hostname:            "true primary",
					Keyspace:            "ks1",
					Shard:               "-",
					Type:                topodatapb.TabletType_MASTER,
					MasterTermStartTime: logutil.TimeToProto(time.Date(2006, time.January, 2, 16, 4, 5, 0, time.UTC)),
				},
			},
			req: &vtctldatapb.GetTabletsRequest{},
			expected: []*topodatapb.Tablet{
				{
					Alias: &topodatapb.TabletAlias{
						Cell: "cell1",
						Uid:  100,
					},
					Keyspace:            "ks1",
					Shard:               "-",
					Hostname:            "slightly less stale",
					Type:                topodatapb.TabletType_UNKNOWN,
					MasterTermStartTime: logutil.TimeToProto(time.Date(2006, time.January, 2, 15, 4, 5, 0, time.UTC)),
				},
				{
					Alias: &topodatapb.TabletAlias{
						Cell: "cell1",
						Uid:  101,
					},
					Hostname:            "stale primary",
					Keyspace:            "ks1",
					Shard:               "-",
					Type:                topodatapb.TabletType_UNKNOWN,
					MasterTermStartTime: logutil.TimeToProto(time.Date(2006, time.January, 2, 14, 4, 5, 0, time.UTC)),
				},
				{
					Alias: &topodatapb.TabletAlias{
						Cell: "cell1",
						Uid:  103,
					},
					Hostname:            "true primary",
					Keyspace:            "ks1",
					Shard:               "-",
					Type:                topodatapb.TabletType_MASTER,
					MasterTermStartTime: logutil.TimeToProto(time.Date(2006, time.January, 2, 16, 4, 5, 0, time.UTC)),
				},
			},
			shouldErr: false,
		},
		{
			name:    "keyspace and shard filter - error",
			cells:   []string{"cell1"},
			tablets: []*topodatapb.Tablet{},
			req: &vtctldatapb.GetTabletsRequest{
				Keyspace: "ks1",
				Shard:    "-",
			},
			expected:  []*topodatapb.Tablet{},
			shouldErr: true,
		},
		{
			name:  "cells filter",
			cells: []string{"cell1", "cell2", "cell3"},
			tablets: []*topodatapb.Tablet{
				{
					Alias: &topodatapb.TabletAlias{
						Cell: "cell1",
						Uid:  100,
					},
				},
				{
					Alias: &topodatapb.TabletAlias{
						Cell: "cell2",
						Uid:  200,
					},
				},
				{
					Alias: &topodatapb.TabletAlias{
						Cell: "cell3",
						Uid:  300,
					},
				},
			},
			req: &vtctldatapb.GetTabletsRequest{
				Cells: []string{"cell1", "cell3"},
			},
			expected: []*topodatapb.Tablet{
				{
					Alias: &topodatapb.TabletAlias{
						Cell: "cell1",
						Uid:  100,
					},
				},
				{
					Alias: &topodatapb.TabletAlias{
						Cell: "cell3",
						Uid:  300,
					},
				},
			},
			shouldErr: false,
		},
		{
			name:  "cells filter - error",
			cells: []string{"cell1"},
			tablets: []*topodatapb.Tablet{
				{
					Alias: &topodatapb.TabletAlias{
						Cell: "cell1",
						Uid:  100,
					},
					Keyspace: "ks1",
					Shard:    "-",
				},
			},
			req: &vtctldatapb.GetTabletsRequest{
				Cells: []string{"cell1", "doesnotexist"},
			},
			expected:  []*topodatapb.Tablet{},
			shouldErr: true,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			ctx := context.Background()
			ts := memorytopo.NewServer(tt.cells...)
			vtctld := NewVtctldServer(ts)

			for _, tablet := range tt.tablets {
				testutil.AddTablet(ctx, t, ts, tablet)
			}

			resp, err := vtctld.GetTablets(ctx, tt.req)
			if tt.shouldErr {
				assert.Error(t, err)
				return
			}

			assert.NoError(t, err)
			assert.ElementsMatch(t, tt.expected, resp.Tablets)
		})
	}
}
