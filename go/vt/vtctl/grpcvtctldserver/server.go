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
	"fmt"
	"path/filepath"
	"time"

	"google.golang.org/grpc"

	"vitess.io/vitess/go/vt/log"
	"vitess.io/vitess/go/vt/mysqlctl/backupstorage"
	"vitess.io/vitess/go/vt/mysqlctl/mysqlctlproto"
	"vitess.io/vitess/go/vt/topo"
	"vitess.io/vitess/go/vt/topotools"
	"vitess.io/vitess/go/vt/vtctl/workflow"
	"vitess.io/vitess/go/vt/vterrors"
	"vitess.io/vitess/go/vt/vttablet/tmclient"

	mysqlctlpb "vitess.io/vitess/go/vt/proto/mysqlctl"
	tabletmanagerdatapb "vitess.io/vitess/go/vt/proto/tabletmanagerdata"
	topodatapb "vitess.io/vitess/go/vt/proto/topodata"
	vschemapb "vitess.io/vitess/go/vt/proto/vschema"
	vtctldatapb "vitess.io/vitess/go/vt/proto/vtctldata"
	vtctlservicepb "vitess.io/vitess/go/vt/proto/vtctlservice"
	"vitess.io/vitess/go/vt/proto/vtrpc"
)

// VtctldServer implements the Vtctld RPC service protocol.
type VtctldServer struct {
	ts  *topo.Server
	tmc tmclient.TabletManagerClient
	ws  *workflow.Server
}

// NewVtctldServer returns a new VtctldServer for the given topo server.
func NewVtctldServer(ts *topo.Server) *VtctldServer {
	tmc := tmclient.NewTabletManagerClient()

	return &VtctldServer{
		ts:  ts,
		tmc: tmc,
		ws:  workflow.NewServer(ts, tmc),
	}
}

// ChangeTabletType is part of the vtctlservicepb.VtctldServer interface.
func (s *VtctldServer) ChangeTabletType(ctx context.Context, req *vtctldatapb.ChangeTabletTypeRequest) (*vtctldatapb.ChangeTabletTypeResponse, error) {
	tablet, err := s.ts.GetTablet(ctx, req.TabletAlias)
	if err != nil {
		return nil, err
	}

	if !topo.IsTrivialTypeChange(tablet.Type, req.DbType) {
		return nil, fmt.Errorf("tablet %v type change %v -> %v is not an allowed transition for ChangeTabletType", req.TabletAlias, tablet.Type, req.DbType)
	}

	if req.DryRun {
		afterTablet := *tablet.Tablet
		afterTablet.Type = req.DbType

		return &vtctldatapb.ChangeTabletTypeResponse{
			BeforeTablet: tablet.Tablet,
			AfterTablet:  &afterTablet,
			WasDryRun:    true,
		}, nil
	}

	err = s.tmc.ChangeType(ctx, tablet.Tablet, req.DbType)
	if err != nil {
		return nil, err
	}

	var changedTablet *topodatapb.Tablet

	changedTabletInfo, err := s.ts.GetTablet(ctx, req.TabletAlias)
	if err != nil {
		log.Warningf("error while reading the tablet we just changed back out of the topo: %v", err)
	} else {
		changedTablet = changedTabletInfo.Tablet
	}

	return &vtctldatapb.ChangeTabletTypeResponse{
		BeforeTablet: tablet.Tablet,
		AfterTablet:  changedTablet,
		WasDryRun:    false,
	}, nil
}

// CreateKeyspace is part of the vtctlservicepb.VtctldServer interface.
func (s *VtctldServer) CreateKeyspace(ctx context.Context, req *vtctldatapb.CreateKeyspaceRequest) (*vtctldatapb.CreateKeyspaceResponse, error) {
	switch req.Type {
	case topodatapb.KeyspaceType_NORMAL:
	case topodatapb.KeyspaceType_SNAPSHOT:
		if req.BaseKeyspace == "" {
			return nil, errors.New("BaseKeyspace is required for SNAPSHOT keyspaces")
		}

		if req.SnapshotTime == nil {
			return nil, errors.New("SnapshotTime is required for SNAPSHOT keyspaces")
		}
	default:
		return nil, fmt.Errorf("unknown keyspace type %v", req.Type)
	}

	ki := &topodatapb.Keyspace{
		KeyspaceType:       req.Type,
		ShardingColumnName: req.ShardingColumnName,
		ShardingColumnType: req.ShardingColumnType,

		ServedFroms: req.ServedFroms,

		BaseKeyspace: req.BaseKeyspace,
		SnapshotTime: req.SnapshotTime,
	}

	err := s.ts.CreateKeyspace(ctx, req.Name, ki)
	if req.Force && topo.IsErrType(err, topo.NodeExists) {
		log.Infof("keyspace %v already exists (ignoring error with Force=true)", req.Name)
		err = nil

		// Get the actual keyspace out of the topo; it may differ in structure,
		// and we want to return the authoritative version as the "created" one
		// to the client.
		var ks *topo.KeyspaceInfo
		ks, _ = s.ts.GetKeyspace(ctx, req.Name)
		ki = ks.Keyspace
	}

	if err != nil {
		return nil, err
	}

	if !req.AllowEmptyVSchema {
		if err := s.ts.EnsureVSchema(ctx, req.Name); err != nil {
			return nil, err
		}
	}

	if req.Type == topodatapb.KeyspaceType_SNAPSHOT {
		vs, err := s.ts.GetVSchema(ctx, req.BaseKeyspace)
		if err != nil {
			log.Infof("error from GetVSchema(%v) = %v", req.BaseKeyspace, err)
			if topo.IsErrType(err, topo.NoNode) {
				log.Infof("base keyspace %v does not exist; continuing with bare, unsharded vschema", req.BaseKeyspace)
				vs = &vschemapb.Keyspace{
					Sharded:  false,
					Tables:   map[string]*vschemapb.Table{},
					Vindexes: map[string]*vschemapb.Vindex{},
				}
			} else {
				return nil, err
			}
		}

		// SNAPSHOT keyspaces are excluded from global routing.
		vs.RequireExplicitRouting = true

		if err := s.ts.SaveVSchema(ctx, req.Name, vs); err != nil {
			return nil, fmt.Errorf("SaveVSchema(%v) = %w", vs, err)
		}
	}

	cells := []string{}
	err = s.ts.RebuildSrvVSchema(ctx, cells)
	if err != nil {
		return nil, fmt.Errorf("RebuildSrvVSchema(%v) = %w", cells, err)
	}

	return &vtctldatapb.CreateKeyspaceResponse{
		Keyspace: &vtctldatapb.Keyspace{
			Name:     req.Name,
			Keyspace: ki,
		},
	}, nil
}

// CreateShard is part of the vtctlservicepb.VtctldServer interface.
func (s *VtctldServer) CreateShard(ctx context.Context, req *vtctldatapb.CreateShardRequest) (*vtctldatapb.CreateShardResponse, error) {
	if req.IncludeParent {
		log.Infof("Creating empty keyspace for %s", req.Keyspace)
		if err := s.ts.CreateKeyspace(ctx, req.Keyspace, &topodatapb.Keyspace{}); err != nil {
			if req.Force && topo.IsErrType(err, topo.NodeExists) {
				log.Infof("keyspace %v already exists; ignoring error because Force = true", req.Keyspace)
			} else {
				return nil, err
			}
		}
	}

	shardExists := false

	if err := s.ts.CreateShard(ctx, req.Keyspace, req.ShardName); err != nil {
		if req.Force && topo.IsErrType(err, topo.NodeExists) {
			log.Infof("shard %v/%v already exists; ignoring error because Force = true", req.Keyspace, req.ShardName)
			shardExists = true
		} else {
			return nil, err
		}
	}

	// Fetch what we just created out of the topo. Errors should never happen
	// here, but we'll check them anyway.

	ks, err := s.ts.GetKeyspace(ctx, req.Keyspace)
	if err != nil {
		return nil, err
	}

	shard, err := s.ts.GetShard(ctx, req.Keyspace, req.ShardName)
	if err != nil {
		return nil, err
	}

	return &vtctldatapb.CreateShardResponse{
		Keyspace: &vtctldatapb.Keyspace{
			Name:     req.Keyspace,
			Keyspace: ks.Keyspace,
		},
		Shard: &vtctldatapb.Shard{
			Keyspace: req.Keyspace,
			Name:     req.ShardName,
			Shard:    shard.Shard,
		},
		ShardAlreadyExists: shardExists,
	}, nil
}

// DeleteKeyspace is part of the vtctlservicepb.VtctldServer interface.
func (s *VtctldServer) DeleteKeyspace(ctx context.Context, req *vtctldatapb.DeleteKeyspaceRequest) (*vtctldatapb.DeleteKeyspaceResponse, error) {
	shards, err := s.ts.GetShardNames(ctx, req.Keyspace)
	if err != nil {
		return nil, err
	}

	if len(shards) > 0 {
		if !req.Recursive {
			return nil, vterrors.Errorf(vtrpc.Code_FAILED_PRECONDITION, "keyspace %v still has %d shards; use Recursive=true or remove them manually", req.Keyspace, len(shards))
		}

		log.Infof("Deleting all %d shards (and their tablets) in keyspace %v", len(shards), req.Keyspace)
		recursive := true
		evenIfServing := true

		for _, shard := range shards {
			log.Infof("Recursively deleting shard %v/%v", req.Keyspace, shard)
			if err := deleteShard(ctx, s.ts, req.Keyspace, shard, recursive, evenIfServing); err != nil {
				return nil, fmt.Errorf("cannot delete shard %v/%v: %w", req.Keyspace, shard, err)
			}
		}
	}

	cells, err := s.ts.GetKnownCells(ctx)
	if err != nil {
		return nil, err
	}

	for _, cell := range cells {
		if err := s.ts.DeleteKeyspaceReplication(ctx, cell, req.Keyspace); err != nil && !topo.IsErrType(err, topo.NoNode) {
			log.Warningf("Cannot delete KeyspaceReplication in cell %v for %v: %v", cell, req.Keyspace, err)
		}

		if err := s.ts.DeleteSrvKeyspace(ctx, cell, req.Keyspace); err != nil && !topo.IsErrType(err, topo.NoNode) {
			log.Warningf("Cannot delete SrvKeyspace in cell %v for %v: %v", cell, req.Keyspace, err)
		}
	}

	if err := s.ts.DeleteKeyspace(ctx, req.Keyspace); err != nil {
		return nil, err
	}

	return &vtctldatapb.DeleteKeyspaceResponse{}, nil
}

// DeleteShards is part of the vtctlservicepb.VtctldServer interface.
func (s *VtctldServer) DeleteShards(ctx context.Context, req *vtctldatapb.DeleteShardsRequest) (*vtctldatapb.DeleteShardsResponse, error) {
	for _, shard := range req.Shards {
		if err := deleteShard(ctx, s.ts, shard.Keyspace, shard.Name, req.Recursive, req.EvenIfServing); err != nil {
			return nil, err
		}
	}

	return &vtctldatapb.DeleteShardsResponse{}, nil
}

// DeleteTablets is part of the vtctlservicepb.VtctldServer interface.
func (s *VtctldServer) DeleteTablets(ctx context.Context, req *vtctldatapb.DeleteTabletsRequest) (*vtctldatapb.DeleteTabletsResponse, error) {
	for _, alias := range req.TabletAliases {
		if err := deleteTablet(ctx, s.ts, alias, req.AllowPrimary); err != nil {
			return nil, err
		}
	}

	return &vtctldatapb.DeleteTabletsResponse{}, nil
}

// FindAllShardsInKeyspace is part of the vtctlservicepb.VtctldServer interface.
func (s *VtctldServer) FindAllShardsInKeyspace(ctx context.Context, req *vtctldatapb.FindAllShardsInKeyspaceRequest) (*vtctldatapb.FindAllShardsInKeyspaceResponse, error) {
	result, err := s.ts.FindAllShardsInKeyspace(ctx, req.Keyspace)
	if err != nil {
		return nil, err
	}

	shards := map[string]*vtctldatapb.Shard{}
	for _, shard := range result {
		shards[shard.ShardName()] = &vtctldatapb.Shard{
			Keyspace: req.Keyspace,
			Name:     shard.ShardName(),
			Shard:    shard.Shard,
		}
	}

	return &vtctldatapb.FindAllShardsInKeyspaceResponse{
		Shards: shards,
	}, nil
}

// GetBackups is part of the vtctldservicepb.VtctldServer interface.
func (s *VtctldServer) GetBackups(ctx context.Context, req *vtctldatapb.GetBackupsRequest) (*vtctldatapb.GetBackupsResponse, error) {
	bs, err := backupstorage.GetBackupStorage()
	if err != nil {
		return nil, err
	}

	defer bs.Close()

	bucket := filepath.Join(req.Keyspace, req.Shard)
	bhs, err := bs.ListBackups(ctx, bucket)
	if err != nil {
		return nil, err
	}

	resp := &vtctldatapb.GetBackupsResponse{
		Backups: make([]*mysqlctlpb.BackupInfo, len(bhs)),
	}

	for i, bh := range bhs {
		resp.Backups[i] = mysqlctlproto.BackupHandleToProto(bh)
	}

	return resp, nil
}

// GetCellInfoNames is part of the vtctlservicepb.VtctldServer interface.
func (s *VtctldServer) GetCellInfoNames(ctx context.Context, req *vtctldatapb.GetCellInfoNamesRequest) (*vtctldatapb.GetCellInfoNamesResponse, error) {
	names, err := s.ts.GetCellInfoNames(ctx)
	if err != nil {
		return nil, err
	}

	return &vtctldatapb.GetCellInfoNamesResponse{Names: names}, nil
}

// GetCellInfo is part of the vtctlservicepb.VtctldServer interface.
func (s *VtctldServer) GetCellInfo(ctx context.Context, req *vtctldatapb.GetCellInfoRequest) (*vtctldatapb.GetCellInfoResponse, error) {
	if req.Cell == "" {
		return nil, vterrors.Errorf(vtrpc.Code_INVALID_ARGUMENT, "cell field is required")
	}

	// We use a strong read, because users using this command want the latest
	// data, and this is user-generated, not used in any automated process.
	strongRead := true
	ci, err := s.ts.GetCellInfo(ctx, req.Cell, strongRead)
	if err != nil {
		return nil, err
	}

	return &vtctldatapb.GetCellInfoResponse{CellInfo: ci}, nil
}

// GetCellsAliases is part of the vtctlservicepb.VtctldServer interface.
func (s *VtctldServer) GetCellsAliases(ctx context.Context, req *vtctldatapb.GetCellsAliasesRequest) (*vtctldatapb.GetCellsAliasesResponse, error) {
	strongRead := true
	aliases, err := s.ts.GetCellsAliases(ctx, strongRead)
	if err != nil {
		return nil, err
	}

	return &vtctldatapb.GetCellsAliasesResponse{Aliases: aliases}, nil
}

// GetKeyspace is part of the vtctlservicepb.VtctldServer interface.
func (s *VtctldServer) GetKeyspace(ctx context.Context, req *vtctldatapb.GetKeyspaceRequest) (*vtctldatapb.GetKeyspaceResponse, error) {
	keyspace, err := s.ts.GetKeyspace(ctx, req.Keyspace)
	if err != nil {
		return nil, err
	}

	return &vtctldatapb.GetKeyspaceResponse{
		Keyspace: &vtctldatapb.Keyspace{
			Name:     req.Keyspace,
			Keyspace: keyspace.Keyspace,
		},
	}, nil
}

// GetKeyspaces is part of the vtctlservicepb.VtctldServer interface.
func (s *VtctldServer) GetKeyspaces(ctx context.Context, req *vtctldatapb.GetKeyspacesRequest) (*vtctldatapb.GetKeyspacesResponse, error) {
	names, err := s.ts.GetKeyspaces(ctx)
	if err != nil {
		return nil, err
	}

	keyspaces := make([]*vtctldatapb.Keyspace, len(names))

	for i, name := range names {
		ks, err := s.GetKeyspace(ctx, &vtctldatapb.GetKeyspaceRequest{Keyspace: name})
		if err != nil {
			return nil, err
		}

		keyspaces[i] = ks.Keyspace
	}

	return &vtctldatapb.GetKeyspacesResponse{Keyspaces: keyspaces}, nil
}

// GetSchema is part of the vtctlservicepb.VtctldServer interface.
func (s *VtctldServer) GetSchema(ctx context.Context, req *vtctldatapb.GetSchemaRequest) (*vtctldatapb.GetSchemaResponse, error) {
	tablet, err := s.ts.GetTablet(ctx, req.TabletAlias)
	if err != nil {
		return nil, fmt.Errorf("GetTablet(%v) failed: %w", req.TabletAlias, err)
	}

	sd, err := s.tmc.GetSchema(ctx, tablet.Tablet, req.Tables, req.ExcludeTables, req.IncludeViews)
	if err != nil {
		return nil, fmt.Errorf("GetSchema(%v, %v, %v, %v) failed: %w", tablet.Tablet, req.Tables, req.ExcludeTables, req.IncludeViews, err)
	}

	if req.TableNamesOnly {
		nameTds := make([]*tabletmanagerdatapb.TableDefinition, len(sd.TableDefinitions))

		for i, td := range sd.TableDefinitions {
			nameTds[i] = &tabletmanagerdatapb.TableDefinition{
				Name: td.Name,
			}
		}

		sd.TableDefinitions = nameTds
	} else if req.TableSizesOnly {
		sizeTds := make([]*tabletmanagerdatapb.TableDefinition, len(sd.TableDefinitions))

		for i, td := range sd.TableDefinitions {
			sizeTds[i] = &tabletmanagerdatapb.TableDefinition{
				Name:       td.Name,
				Type:       td.Type,
				RowCount:   td.RowCount,
				DataLength: td.DataLength,
			}
		}

		sd.TableDefinitions = sizeTds
	}

	return &vtctldatapb.GetSchemaResponse{
		Schema: sd,
	}, nil
}

// GetShard is part of the vtctlservicepb.VtctldServer interface.
func (s *VtctldServer) GetShard(ctx context.Context, req *vtctldatapb.GetShardRequest) (*vtctldatapb.GetShardResponse, error) {
	shard, err := s.ts.GetShard(ctx, req.Keyspace, req.ShardName)
	if err != nil {
		return nil, err
	}

	return &vtctldatapb.GetShardResponse{
		Shard: &vtctldatapb.Shard{
			Keyspace: req.Keyspace,
			Name:     req.ShardName,
			Shard:    shard.Shard,
		},
	}, nil
}

// GetSrvVSchema is part of the vtctlservicepb.VtctldServer interface.
func (s *VtctldServer) GetSrvVSchema(ctx context.Context, req *vtctldatapb.GetSrvVSchemaRequest) (*vtctldatapb.GetSrvVSchemaResponse, error) {
	vschema, err := s.ts.GetSrvVSchema(ctx, req.Cell)
	if err != nil {
		return nil, err
	}

	return &vtctldatapb.GetSrvVSchemaResponse{
		SrvVSchema: vschema,
	}, nil
}

// GetTablet is part of the vtctlservicepb.VtctldServer interface.
func (s *VtctldServer) GetTablet(ctx context.Context, req *vtctldatapb.GetTabletRequest) (*vtctldatapb.GetTabletResponse, error) {
	ti, err := s.ts.GetTablet(ctx, req.TabletAlias)
	if err != nil {
		return nil, err
	}

	return &vtctldatapb.GetTabletResponse{
		Tablet: ti.Tablet,
	}, nil
}

// GetTablets is part of the vtctlservicepb.VtctldServer interface.
func (s *VtctldServer) GetTablets(ctx context.Context, req *vtctldatapb.GetTabletsRequest) (*vtctldatapb.GetTabletsResponse, error) {
	// It is possible that an old primary has not yet updated its type in the
	// topo. In that case, report its type as UNKNOWN. It used to be MASTER but
	// is no longer the serving primary.
	adjustTypeForStalePrimary := func(ti *topo.TabletInfo, mtst time.Time) {
		if ti.Type == topodatapb.TabletType_MASTER && ti.GetMasterTermStartTime().Before(mtst) {
			ti.Tablet.Type = topodatapb.TabletType_UNKNOWN
		}
	}

	if req.Keyspace != "" && req.Shard != "" {
		tabletMap, err := s.ts.GetTabletMapForShard(ctx, req.Keyspace, req.Shard)
		if err != nil {
			return nil, err
		}

		var trueMasterTimestamp time.Time
		for _, ti := range tabletMap {
			if ti.Type == topodatapb.TabletType_MASTER {
				masterTimestamp := ti.GetMasterTermStartTime()
				if masterTimestamp.After(trueMasterTimestamp) {
					trueMasterTimestamp = masterTimestamp
				}
			}
		}

		tablets := make([]*topodatapb.Tablet, 0, len(tabletMap))
		for _, ti := range tabletMap {
			adjustTypeForStalePrimary(ti, trueMasterTimestamp)
			tablets = append(tablets, ti.Tablet)
		}

		return &vtctldatapb.GetTabletsResponse{Tablets: tablets}, nil
	}

	cells := req.Cells
	if len(cells) == 0 {
		c, err := s.ts.GetKnownCells(ctx)
		if err != nil {
			return nil, err
		}

		cells = c
	}

	var allTablets []*topodatapb.Tablet

	for _, cell := range cells {
		tablets, err := topotools.GetAllTablets(ctx, s.ts, cell)
		if err != nil {
			return nil, err
		}

		// Collect true master term start times, and optionally filter out any
		// tablets by keyspace according to the request.
		masterTermStartTimes := map[string]time.Time{}
		filteredTablets := make([]*topo.TabletInfo, 0, len(tablets))

		for _, tablet := range tablets {
			if req.Keyspace != "" && tablet.Keyspace != req.Keyspace {
				continue
			}

			key := tablet.Keyspace + "." + tablet.Shard
			if v, ok := masterTermStartTimes[key]; ok {
				if tablet.GetMasterTermStartTime().After(v) {
					masterTermStartTimes[key] = tablet.GetMasterTermStartTime()
				}
			} else {
				masterTermStartTimes[key] = tablet.GetMasterTermStartTime()
			}

			filteredTablets = append(filteredTablets, tablet)
		}

		// collect the tablets with adjusted master term start times. they've
		// already been filtered by the above loop, so no keyspace filtering
		// here.
		for _, ti := range filteredTablets {
			key := ti.Keyspace + "." + ti.Shard
			adjustTypeForStalePrimary(ti, masterTermStartTimes[key])

			allTablets = append(allTablets, ti.Tablet)
		}
	}

	return &vtctldatapb.GetTabletsResponse{
		Tablets: allTablets,
	}, nil
}

// GetVSchema is part of the vtctlservicepb.VtctldServer interface.
func (s *VtctldServer) GetVSchema(ctx context.Context, req *vtctldatapb.GetVSchemaRequest) (*vtctldatapb.GetVSchemaResponse, error) {
	vschema, err := s.ts.GetVSchema(ctx, req.Keyspace)
	if err != nil {
		return nil, err
	}

	return &vtctldatapb.GetVSchemaResponse{
		VSchema: vschema,
	}, nil
}

// GetWorkflows is part of the vtctlservicepb.VtctldServer interface.
func (s *VtctldServer) GetWorkflows(ctx context.Context, req *vtctldatapb.GetWorkflowsRequest) (*vtctldatapb.GetWorkflowsResponse, error) {
	return s.ws.GetWorkflows(ctx, req)
}

// RemoveKeyspaceCell is part of the vtctlservicepb.VtctldServer interface.
func (s *VtctldServer) RemoveKeyspaceCell(ctx context.Context, req *vtctldatapb.RemoveKeyspaceCellRequest) (*vtctldatapb.RemoveKeyspaceCellResponse, error) {
	shards, err := s.ts.GetShardNames(ctx, req.Keyspace)
	if err != nil {
		return nil, err
	}

	// Remove all the shards, serially. Stop immediately if any fail.
	for _, shard := range shards {
		log.Infof("Removing cell %v from shard %v/%v", req.Cell, req.Keyspace, shard)
		if err := removeShardCell(ctx, s.ts, req.Cell, req.Keyspace, shard, req.Recursive, req.Force); err != nil {
			return nil, fmt.Errorf("cannot remove cell %v from shard %v/%v: %w", req.Cell, req.Keyspace, shard, err)
		}
	}

	// Last, remove the SrvKeyspace object.
	log.Infof("Removing cell %v keyspace %v SrvKeyspace object", req.Cell, req.Keyspace)
	if err := s.ts.DeleteSrvKeyspace(ctx, req.Cell, req.Keyspace); err != nil {
		return nil, fmt.Errorf("cannot delete SrvKeyspace from cell %v for keyspace %v: %w", req.Cell, req.Keyspace, err)
	}

	return &vtctldatapb.RemoveKeyspaceCellResponse{}, nil
}

// RemoveShardCell is part of the vtctlservicepb.VtctldServer interface.
func (s *VtctldServer) RemoveShardCell(ctx context.Context, req *vtctldatapb.RemoveShardCellRequest) (*vtctldatapb.RemoveShardCellResponse, error) {
	if err := removeShardCell(ctx, s.ts, req.Cell, req.Keyspace, req.ShardName, req.Recursive, req.Force); err != nil {
		return nil, err
	}

	return &vtctldatapb.RemoveShardCellResponse{}, nil
}

// StartServer registers a VtctldServer for RPCs on the given gRPC server.
func StartServer(s *grpc.Server, ts *topo.Server) {
	vtctlservicepb.RegisterVtctldServer(s, NewVtctldServer(ts))
}
