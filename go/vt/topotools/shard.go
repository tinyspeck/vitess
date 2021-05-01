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

package topotools

import (
	"context"
	"fmt"

	"vitess.io/vitess/go/vt/logutil"
	"vitess.io/vitess/go/vt/topo"

	topodatapb "vitess.io/vitess/go/vt/proto/topodata"
)

// DeleteShard will do all the necessary changes in the topology server to
// entirely remove a shard.
func DeleteShard(ctx context.Context, ts *topo.Server, keyspace string, shard string, recursive bool, evenIfServing bool, logger logutil.Logger) error {
	// Read the Shard object. If it's not there, try to clean up
	// the topology anyway.
	shardInfo, err := ts.GetShard(ctx, keyspace, shard)
	if err != nil {
		if topo.IsErrType(err, topo.NoNode) {
			logger.Infof("Shard %v/%v doesn't seem to exist, cleaning up any potential leftover", keyspace, shard)
			return ts.DeleteShard(ctx, keyspace, shard)
		}
		return err
	}

	servingCells, err := ts.GetShardServingCells(ctx, shardInfo)
	if err != nil {
		return err
	}
	// Check the Serving map for the shard, we don't want to
	// remove a serving shard if not absolutely sure.
	if !evenIfServing && len(servingCells) > 0 {
		return fmt.Errorf("shard %v/%v is still serving, cannot delete it, use even_if_serving flag if needed", keyspace, shard)
	}

	cells, err := ts.GetCellInfoNames(ctx)
	if err != nil {
		return err
	}

	// Go through all the cells.
	for _, cell := range cells {
		var aliases []*topodatapb.TabletAlias

		// Get the ShardReplication object for that cell. Try
		// to find all tablets that may belong to our shard.
		sri, err := ts.GetShardReplication(ctx, cell, keyspace, shard)
		switch {
		case topo.IsErrType(err, topo.NoNode):
			// No ShardReplication object. It means the
			// topo is inconsistent. Let's read all the
			// tablets for that cell, and if we find any
			// in our keyspace / shard, either abort or
			// try to delete them.
			aliases, err = ts.GetTabletsByCell(ctx, cell)
			if err != nil {
				return fmt.Errorf("GetTabletsByCell(%v) failed: %v", cell, err)
			}
		case err == nil:
			// We found a ShardReplication object. We
			// trust it to have all tablet records.
			aliases = make([]*topodatapb.TabletAlias, len(sri.Nodes))
			for i, n := range sri.Nodes {
				aliases[i] = n.TabletAlias
			}
		default:
			return fmt.Errorf("GetShardReplication(%v, %v, %v) failed: %v", cell, keyspace, shard, err)
		}

		// Get the corresponding Tablet records. Note
		// GetTabletMap ignores ErrNoNode, and it's good for
		// our purpose, it means a tablet was deleted but is
		// still referenced.
		tabletMap, err := ts.GetTabletMap(ctx, aliases)
		if err != nil {
			return fmt.Errorf("GetTabletMap() failed: %v", err)
		}

		// Remove the tablets that don't belong to our
		// keyspace/shard from the map.
		for a, ti := range tabletMap {
			if ti.Keyspace != keyspace || ti.Shard != shard {
				delete(tabletMap, a)
			}
		}

		// Now see if we need to DeleteTablet, and if we can, do it.
		if len(tabletMap) > 0 {
			if !recursive {
				return fmt.Errorf("shard %v/%v still has %v tablets in cell %v; use -recursive or remove them manually", keyspace, shard, len(tabletMap), cell)
			}

			logger.Infof("Deleting all tablets in shard %v/%v cell %v", keyspace, shard, cell)
			for tabletAlias, tabletInfo := range tabletMap {
				// We don't care about scrapping or updating the replication graph,
				// because we're about to delete the entire replication graph.
				logger.Infof("Deleting tablet %v", tabletAlias)
				if err := ts.DeleteTablet(ctx, tabletInfo.Alias); err != nil && !topo.IsErrType(err, topo.NoNode) {
					// We don't want to continue if a DeleteTablet fails for
					// any good reason (other than missing tablet, in which
					// case it's just a topology server inconsistency we can
					// ignore). If we continue and delete the replication
					// graph, the tablet record will be orphaned, since
					// we'll no longer know it belongs to this shard.
					//
					// If the problem is temporary, or resolved externally, re-running
					// DeleteShard will skip over tablets that were already deleted.
					return fmt.Errorf("can't delete tablet %v: %v", tabletAlias, err)
				}
			}
		}
	}

	// Try to remove the replication graph and serving graph in each cell,
	// regardless of its existence.
	for _, cell := range cells {
		if err := ts.DeleteShardReplication(ctx, cell, keyspace, shard); err != nil && !topo.IsErrType(err, topo.NoNode) {
			logger.Warningf("Cannot delete ShardReplication in cell %v for %v/%v: %v", cell, keyspace, shard, err)
		}
	}

	return ts.DeleteShard(ctx, keyspace, shard)
}
