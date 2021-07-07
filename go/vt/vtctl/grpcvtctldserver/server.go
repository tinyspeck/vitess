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
	"sync"
	"time"

	"google.golang.org/grpc"
	"k8s.io/apimachinery/pkg/util/sets"

	"vitess.io/vitess/go/trace"
	"vitess.io/vitess/go/vt/concurrency"
	"vitess.io/vitess/go/vt/log"
	"vitess.io/vitess/go/vt/mysqlctl"
	"vitess.io/vitess/go/vt/mysqlctl/backupstorage"
	"vitess.io/vitess/go/vt/mysqlctl/mysqlctlproto"
	"vitess.io/vitess/go/vt/topo"
	"vitess.io/vitess/go/vt/topotools"
	"vitess.io/vitess/go/vt/vtctl/workflow"
	"vitess.io/vitess/go/vt/vterrors"
	"vitess.io/vitess/go/vt/vttablet/tmclient"

	mysqlctlpb "vitess.io/vitess/go/vt/proto/mysqlctl"
	replicationdatapb "vitess.io/vitess/go/vt/proto/replicationdata"
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
	span, ctx := trace.NewSpan(ctx, "VtctldServer.GetBackups")
	defer span.Finish()

	span.Annotate("keyspace", req.Keyspace)
	span.Annotate("shard", req.Shard)
	span.Annotate("limit", req.Limit)
	span.Annotate("detailed", req.Detailed)
	span.Annotate("detailed_limit", req.DetailedLimit)

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

	totalBackups := len(bhs)
	if req.Limit > 0 {
		totalBackups = int(req.Limit)
	}

	totalDetailedBackups := len(bhs)
	if req.DetailedLimit > 0 {
		totalDetailedBackups = int(req.DetailedLimit)
	}

	backups := make([]*mysqlctlpb.BackupInfo, 0, totalBackups)
	backupsToSkip := len(bhs) - totalBackups
	backupsToSkipDetails := len(bhs) - totalDetailedBackups

	for i, bh := range bhs {
		if i < backupsToSkip {
			continue
		}

		bi := mysqlctlproto.BackupHandleToProto(bh)
		bi.Keyspace = req.Keyspace
		bi.Shard = req.Shard

		if req.Detailed {
			if i >= backupsToSkipDetails {
				engine, status, err := mysqlctl.GetBackupInfo(ctx, bh)
				if err != nil {
					log.Warningf("error getting detailed backup info for %s/%s %s/%s: %s", bi.Keyspace, bi.Shard, bi.Directory, bi.Name, err)
				}

				bi.Engine = engine
				bi.Status = status
			}
		}

		backups = append(backups, bi)
	}

	return &vtctldatapb.GetBackupsResponse{
		Backups: backups,
	}, nil
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

// GetSrvKeyspaces is part of the vtctlservicepb.VtctldServer interface.
func (s *VtctldServer) GetSrvKeyspaces(ctx context.Context, req *vtctldatapb.GetSrvKeyspacesRequest) (*vtctldatapb.GetSrvKeyspacesResponse, error) {
	cells := req.Cells

	if len(cells) == 0 {
		var err error

		cells, err = s.ts.GetCellInfoNames(ctx)
		if err != nil {
			return nil, err
		}
	}

	srvKeyspaces := make(map[string]*topodatapb.SrvKeyspace, len(cells))

	for _, cell := range cells {
		srvKeyspace, err := s.ts.GetSrvKeyspace(ctx, cell, req.Keyspace)

		if err != nil {
			if !topo.IsErrType(err, topo.NoNode) {
				return nil, err
			}

			log.Warningf("no srvkeyspace for keyspace %s in cell %s", req.Keyspace, cell)

			srvKeyspace = nil
		}

		srvKeyspaces[cell] = srvKeyspace
	}

	return &vtctldatapb.GetSrvKeyspacesResponse{
		SrvKeyspaces: srvKeyspaces,
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

// GetSrvVSchemas is part of the vtctlservicepb.VtctldServer interface.
func (s *VtctldServer) GetSrvVSchemas(ctx context.Context, req *vtctldatapb.GetSrvVSchemasRequest) (*vtctldatapb.GetSrvVSchemasResponse, error) {
	allCells, err := s.ts.GetCellInfoNames(ctx)
	if err != nil {
		return nil, err
	}

	cells := allCells

	// Omit any cell names in the request that don't map to existing cells
	if len(req.Cells) > 0 {
		s1 := sets.NewString(allCells...)
		s2 := sets.NewString(req.Cells...)

		cells = s1.Intersection(s2).List()
	}

	svs := make(map[string]*vschemapb.SrvVSchema, len(cells))

	for _, cell := range cells {
		sv, err := s.ts.GetSrvVSchema(ctx, cell)

		if err != nil {
			if !topo.IsErrType(err, topo.NoNode) {
				return nil, err
			}

			log.Warningf("no SrvVSchema for cell %s", cell)
			sv = nil
		}

		svs[cell] = sv
	}

	return &vtctldatapb.GetSrvVSchemasResponse{
		SrvVSchemas: svs,
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

	// Create a context for our per-cell RPCs, with a timeout upper-bounded at
	// the RemoteOperationTimeout.
	//
	// Per-cell goroutines may also cancel this context if they fail and the
	// request specified Strict=true to allow us to fail faster.
	ctx, cancel := context.WithTimeout(ctx, *topo.RemoteOperationTimeout)
	defer cancel()

	var (
		tabletMap map[string]*topo.TabletInfo
		err       error
	)

	switch {
	case len(req.TabletAliases) > 0:
		tabletMap, err = s.ts.GetTabletMap(ctx, req.TabletAliases)
		if err != nil {
			err = fmt.Errorf("GetTabletMap(%v) failed: %w", req.TabletAliases, err)
		}
	case req.Keyspace != "" && req.Shard != "":
		tabletMap, err = s.ts.GetTabletMapForShard(ctx, req.Keyspace, req.Shard)
		if err != nil {
			err = fmt.Errorf("GetTabletMapForShard(%s, %s) failed: %w", req.Keyspace, req.Shard, err)
		}
	default:
		// goto the req.Cells branch
		tabletMap = nil
	}

	if err != nil {
		switch {
		case topo.IsErrType(err, topo.PartialResult):
			if req.Strict {
				return nil, err
			}

			log.Warningf("GetTablets encountered non-fatal error %s; continuing because Strict=false", err)
		default:
			return nil, err
		}
	}

	if tabletMap != nil {
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

	var (
		m          sync.Mutex
		wg         sync.WaitGroup
		rec        concurrency.AllErrorRecorder
		allTablets []*topo.TabletInfo
	)

	for _, cell := range cells {
		wg.Add(1)

		go func(cell string) {
			defer wg.Done()

			tablets, err := topotools.GetAllTablets(ctx, s.ts, cell)
			if err != nil {
				if req.Strict {
					log.Infof("GetTablets got an error from cell %s: %s. Running in strict mode, so canceling other cell RPCs", cell, err)
					cancel()
				}

				rec.RecordError(fmt.Errorf("GetAllTablets(cell = %s) failed: %w", cell, err))

				return
			}

			m.Lock()
			defer m.Unlock()
			allTablets = append(allTablets, tablets...)
		}(cell)
	}

	wg.Wait()

	if rec.HasErrors() {
		if req.Strict || len(rec.Errors) == len(cells) {
			return nil, rec.Error()
		}
	}

	// Collect true master term start times, and optionally filter out any
	// tablets by keyspace according to the request.
	masterTermStartTimes := map[string]time.Time{}
	filteredTablets := make([]*topo.TabletInfo, 0, len(allTablets))

	for _, tablet := range allTablets {
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

	adjustedTablets := make([]*topodatapb.Tablet, len(filteredTablets))

	// collect the tablets with adjusted master term start times. they've
	// already been filtered by the above loop, so no keyspace filtering
	// here.
	for i, ti := range filteredTablets {
		key := ti.Keyspace + "." + ti.Shard
		adjustTypeForStalePrimary(ti, masterTermStartTimes[key])

		adjustedTablets[i] = ti.Tablet
	}

	return &vtctldatapb.GetTabletsResponse{
		Tablets: adjustedTablets,
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
	span, ctx := trace.NewSpan(ctx, "VtctldServer.GetWorkflows")
	defer span.Finish()

	span.Annotate("keyspace", req.Keyspace)
	span.Annotate("active_only", req.ActiveOnly)

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

// ShardReplicationPositions is part of the vtctldservicepb.VtctldServer interface.
func (s *VtctldServer) ShardReplicationPositions(ctx context.Context, req *vtctldatapb.ShardReplicationPositionsRequest) (*vtctldatapb.ShardReplicationPositionsResponse, error) {
	tabletInfoMap, err := s.ts.GetTabletMapForShard(ctx, req.Keyspace, req.Shard)
	if err != nil {
		return nil, fmt.Errorf("GetTabletMapForShard(%s, %s) failed: %w", req.Keyspace, req.Shard, err)
	}

	log.Infof("Gathering tablet replication status for: %v", tabletInfoMap)

	var (
		m         sync.Mutex
		wg        sync.WaitGroup
		rec       concurrency.AllErrorRecorder
		results   = make(map[string]*replicationdatapb.Status, len(tabletInfoMap))
		tabletMap = make(map[string]*topodatapb.Tablet, len(tabletInfoMap))
	)

	// For each tablet, we're going to create an individual context, using
	// *topo.RemoteOperationTimeout as the maximum timeout (but we'll respect
	// any stricter timeout in the parent context). If an individual tablet
	// times out fetching its replication position, we won't fail the overall
	// request. Instead, we'll log a warning and record a nil entry in the
	// result map; that way, the caller can tell the difference between a tablet
	// that timed out vs a tablet that didn't get queried at all.

	for alias, tabletInfo := range tabletInfoMap {
		switch {
		case tabletInfo.Type == topodatapb.TabletType_MASTER:
			wg.Add(1)

			go func(ctx context.Context, alias string, tablet *topodatapb.Tablet) {
				defer wg.Done()

				ctx, cancel := context.WithTimeout(ctx, *topo.RemoteOperationTimeout)
				defer cancel()

				var status *replicationdatapb.Status

				pos, err := s.tmc.MasterPosition(ctx, tablet)
				if err != nil {
					switch ctx.Err() {
					case context.Canceled:
						log.Warningf("context canceled before obtaining master position from %s: %s", alias, err)
					case context.DeadlineExceeded:
						log.Warningf("context deadline exceeded before obtaining master position from %s: %s", alias, err)
					default:
						// The RPC was not timed out or canceled. We treat this
						// as a fatal error for the overall request.
						rec.RecordError(fmt.Errorf("MasterPosition(%s) failed: %w", alias, err))
						return
					}
				} else {
					// No error, record a valid status for this tablet.
					status = &replicationdatapb.Status{
						Position: pos,
					}
				}

				m.Lock()
				defer m.Unlock()

				results[alias] = status
				tabletMap[alias] = tablet
			}(ctx, alias, tabletInfo.Tablet)
		case tabletInfo.IsReplicaType():
			wg.Add(1)

			go func(ctx context.Context, alias string, tablet *topodatapb.Tablet) {
				defer wg.Done()

				ctx, cancel := context.WithTimeout(ctx, *topo.RemoteOperationTimeout)
				defer cancel()

				status, err := s.tmc.ReplicationStatus(ctx, tablet)
				if err != nil {
					switch ctx.Err() {
					case context.Canceled:
						log.Warningf("context canceled before obtaining replication position from %s: %s", alias, err)
					case context.DeadlineExceeded:
						log.Warningf("context deadline exceeded before obtaining replication position from %s: %s", alias, err)
					default:
						// The RPC was not timed out or canceled. We treat this
						// as a fatal error for the overall request.
						rec.RecordError(fmt.Errorf("ReplicationStatus(%s) failed: %s", alias, err))
						return
					}

					status = nil // Don't record any position for this tablet.
				}

				m.Lock()
				defer m.Unlock()

				results[alias] = status
				tabletMap[alias] = tablet
			}(ctx, alias, tabletInfo.Tablet)
		}
	}

	wg.Wait()

	if rec.HasErrors() {
		return nil, rec.Error()
	}

	return &vtctldatapb.ShardReplicationPositionsResponse{
		ReplicationStatuses: results,
		TabletMap:           tabletMap,
	}, nil
}

// StartServer registers a VtctldServer for RPCs on the given gRPC server.
func StartServer(s *grpc.Server, ts *topo.Server) {
	vtctlservicepb.RegisterVtctldServer(s, NewVtctldServer(ts))
}
