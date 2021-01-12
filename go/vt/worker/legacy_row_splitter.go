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

package worker

// TODO(mberlin): Remove this file when SplitClone supports merge-sorting
// primary key columns based on the MySQL collation.

import (
	"vitess.io/vitess/go/sqltypes"
	"vitess.io/vitess/go/vt/key"
	"vitess.io/vitess/go/vt/topo"

	querypb "vitess.io/vitess/go/vt/proto/query"
	topodatapb "vitess.io/vitess/go/vt/proto/topodata"
)

// RowSplitter is a helper class to split rows into multiple
// subsets targeted to different shards.
type RowSplitter struct {
	tableName   string
	mergeStats  *mergeStatsImpl
	safeError   func(string, error) bool
	KeyResolver keyspaceIDResolver
	KeyRanges   []*topodatapb.KeyRange
}

// NewRowSplitter returns a new row splitter for the given shard distribution.
func NewRowSplitter(
	tableName string,
	stats *mergeStatsImpl,
	canIgnore func(string, error) bool,
	shardInfos []*topo.ShardInfo,
	keyResolver keyspaceIDResolver,
) *RowSplitter {
	result := &RowSplitter{
		tableName:   tableName,
		mergeStats:  stats,
		safeError:   canIgnore,
		KeyResolver: keyResolver,
		KeyRanges:   make([]*topodatapb.KeyRange, len(shardInfos)),
	}
	for i, si := range shardInfos {
		result.KeyRanges[i] = si.KeyRange
	}
	return result
}

// StartSplit starts a new split. Split can then be called multiple times.
func (rs *RowSplitter) StartSplit() [][][]sqltypes.Value {
	return make([][][]sqltypes.Value, len(rs.KeyRanges))
}

// Split will split the rows into subset for each distribution
func (rs *RowSplitter) Split(result [][][]sqltypes.Value, rows [][]sqltypes.Value) error {
	droppedRows := 0
	droppedKeys := []string{}
	safeBadRows := 0
	safeBadKeys := []string{}

	defer func() {
		if droppedRows != 0 {
			rs.mergeStats.dropRows(rs.tableName, droppedRows, droppedKeys)
		}
		if safeBadRows != 0 {
			rs.mergeStats.hitSafeBadRows(rs.tableName, safeBadRows, safeBadKeys)
		}
	}()

	for _, row := range rows {
		k, err := rs.KeyResolver.keyspaceID(row)
		if err != nil {
			if !rs.safeError(rs.tableName, err) {
				rs.mergeStats.hitBadRows(rs.tableName, 1)
				return err
			} else {
				safeBadRows++
				if cr, ok := rs.KeyResolver.(*v3Resolver); ok {
					if len(row) > cr.shardingColumnIndex {
						shardingKey := row[cr.shardingColumnIndex]
						safeBadKeys = append(safeBadKeys, shardingKey.ToString())
					}
				}
			}
		}
		for i, kr := range rs.KeyRanges {
			if key.KeyRangeContains(kr, k) {
				result[i] = append(result[i], row)

				break
			}
			droppedRows++
			if cr, ok := rs.KeyResolver.(*v3Resolver); ok {
				shardingKey := row[cr.shardingColumnIndex]
				droppedKeys = append(droppedKeys, shardingKey.ToString())
			}
		}

	}
	return nil
}

// Send will send the rows to the list of channels. Returns true if aborted.
func (rs *RowSplitter) Send(fields []*querypb.Field, result [][][]sqltypes.Value, baseCmds []string, insertChannels []chan string, abort <-chan struct{}) bool {
	for i, c := range insertChannels {
		// one of the chunks might be empty, so no need
		// to send data in that case
		if len(result[i]) > 0 {
			cmd := baseCmds[i] + makeValueString(fields, result[i])
			// also check on abort, so we don't wait forever
			select {
			case c <- cmd:
			case <-abort:
				return true
			}
		}
	}
	return false
}
