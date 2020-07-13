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

package vindexes

import (
	"encoding/binary"
	"encoding/json"
	"fmt"
	"strings"

	"vitess.io/vitess/go/sqltypes"
	"vitess.io/vitess/go/vt/key"
	topodatapb "vitess.io/vitess/go/vt/proto/topodata"
	vtgatepb "vitess.io/vitess/go/vt/proto/vtgate"
	"vitess.io/vitess/go/vt/vtgate/evalengine"
)

var (
	_ SingleColumn = (*LookupUnique)(nil)
	_ Lookup       = (*LookupUnique)(nil)
	_ SingleColumn = (*LookupNonUnique)(nil)
	_ Lookup       = (*LookupNonUnique)(nil)
)

func init() {
	Register("lookup", NewLookup)
	Register("lookup_unique", NewLookupUnique)
	RegisterValueEncoder("nop", nil)
	RegisterValueEncoder("numeric_uint64", numericUint64)
}

// RegisterValueEncoder will link an encoder that can be used on
// lookup_unique hashes.
func RegisterValueEncoder(name string, fn ValueEncoderFunc) {
	if _, ok := valueEncoders[name]; ok {
		panic(fmt.Sprintf("%s is already registered", name))
	}
	valueEncoders[name] = fn
}

// valueEncoders tracks all the functions that can be applied to Lookup vindex
// values when deriving keyspace ids
var valueEncoders = make(map[string]ValueEncoderFunc)

// ValueEncoderFunc is a function that maps a single lookup result to a
// keyspace id.
type ValueEncoderFunc func(sqltypes.Value) ([]byte, error)

// LookupNonUnique defines a vindex that uses a lookup table and create a mapping between from ids and KeyspaceId.
// It's NonUnique and a Lookup.
type LookupNonUnique struct {
	name      string
	writeOnly bool
	lkp       lookupInternal
	encoders  []ValueEncoderFunc
}

// String returns the name of the vindex.
func (ln *LookupNonUnique) String() string {
	return ln.name
}

// Cost returns the cost of this vindex as 20.
func (ln *LookupNonUnique) Cost() int {
	return 20
}

// IsUnique returns false since the Vindex is non unique.
func (ln *LookupNonUnique) IsUnique() bool {
	return false
}

// NeedsVCursor satisfies the Vindex interface.
func (ln *LookupNonUnique) NeedsVCursor() bool {
	return true
}

// Map can map ids to key.Destination objects.
func (ln *LookupNonUnique) Map(vcursor VCursor, ids []sqltypes.Value) ([]key.Destination, error) {
	out := make([]key.Destination, 0, len(ids))
	if ln.writeOnly {
		for range ids {
			out = append(out, key.DestinationKeyRange{KeyRange: &topodatapb.KeyRange{}})
		}
		return out, nil
	}

	// if ignore_nulls is set and the query is about single null value, then fallback to all shards
	if len(ids) == 1 && ids[0].IsNull() && ln.lkp.IgnoreNulls {
		for range ids {
			out = append(out, key.DestinationKeyRange{KeyRange: &topodatapb.KeyRange{}})
		}
		return out, nil
	}

	results, err := ln.lkp.Lookup(vcursor, ids)
	if err != nil {
		return nil, err
	}
	for _, result := range results {
		if len(result.Rows) == 0 {
			out = append(out, key.DestinationNone{})
			continue
		}
		ksids := make([][]byte, 0, len(result.Rows))
		for i, row := range result.Rows {
			if ln.encoders != nil {
				value := row[0]
				var valueBytes []byte
				if ln.encoders[i] != nil {
					bs, err := ln.encoders[i](value)
					if err != nil {
						return nil, fmt.Errorf("LookupNonUnique.Map: couldn't apply encoding to column %v: %v", i, err)
					}
					valueBytes = bs
				} else {
					valueBytes = value.ToBytes()
				}
				ksids = append(ksids, valueBytes)
			} else {
				ksids = append(ksids, row[0].ToBytes())
			}
		}
		out = append(out, key.DestinationKeyspaceIDs(ksids))
	}
	return out, nil
}

// Verify returns true if ids maps to ksids.
func (ln *LookupNonUnique) Verify(vcursor VCursor, ids []sqltypes.Value, ksids [][]byte) ([]bool, error) {
	if ln.writeOnly {
		out := make([]bool, len(ids))
		for i := range ids {
			out[i] = true
		}
		return out, nil
	}
	return ln.lkp.Verify(vcursor, ids, ksidsToValues(ksids))
}

// Create reserves the id by inserting it into the vindex table.
func (ln *LookupNonUnique) Create(vcursor VCursor, rowsColValues [][]sqltypes.Value, ksids [][]byte, ignoreMode bool) error {
	return ln.lkp.Create(vcursor, rowsColValues, ksidsToValues(ksids), ignoreMode)
}

// Delete deletes the entry from the vindex table.
func (ln *LookupNonUnique) Delete(vcursor VCursor, rowsColValues [][]sqltypes.Value, ksid []byte) error {
	return ln.lkp.Delete(vcursor, rowsColValues, sqltypes.MakeTrusted(sqltypes.VarBinary, ksid), vtgatepb.CommitOrder_NORMAL)
}

// Update updates the entry in the vindex table.
func (ln *LookupNonUnique) Update(vcursor VCursor, oldValues []sqltypes.Value, ksid []byte, newValues []sqltypes.Value) error {
	return ln.lkp.Update(vcursor, oldValues, ksid, sqltypes.MakeTrusted(sqltypes.VarBinary, ksid), newValues)
}

// MarshalJSON returns a JSON representation of LookupHash.
func (ln *LookupNonUnique) MarshalJSON() ([]byte, error) {
	return json.Marshal(ln.lkp)
}

// NewLookup creates a LookupNonUnique vindex.
// The supplied map has the following required fields:
//   table: name of the backing table. It can be qualified by the keyspace.
//   from: list of columns in the table that have the 'from' values of the lookup vindex.
//   to: The 'to' column name of the table.
//
// The following fields are optional:
//   autocommit: setting this to "true" will cause inserts to upsert and deletes to be ignored.
//   write_only: in this mode, Map functions return the full keyrange causing a full scatter.
func NewLookup(name string, m map[string]string) (Vindex, error) {
	lookup := &LookupNonUnique{name: name}

	autocommit, err := boolFromMap(m, "autocommit")
	if err != nil {
		return nil, err
	}
	lookup.writeOnly, err = boolFromMap(m, "write_only")
	if err != nil {
		return nil, err
	}

	// if autocommit is on for non-unique lookup, upsert should also be on.
	if err := lookup.lkp.Init(m, autocommit, autocommit /* upsert */); err != nil {
		return nil, err
	}

	encoders, hasEncoders := m["encoder"]
	if hasEncoders {
		for _, encoderName := range strings.Split(encoders, ",") {
			encoderName = strings.TrimSpace(encoderName)
			encoderFn, validName := valueEncoders[encoderName]
			if !validName {
				return nil, fmt.Errorf("Attempting to use unknown value encoder %v", encoderName)
			}
			lookup.encoders = append(lookup.encoders, encoderFn)
		}
		if len(lookup.encoders) != len(lookup.lkp.FromColumns) {
			return nil, fmt.Errorf("Expected one encoder per from column (%v), got %v", len(lookup.lkp.FromColumns), len(lookup.encoders))
		}
	}

	return lookup, nil
}

func ksidsToValues(ksids [][]byte) []sqltypes.Value {
	values := make([]sqltypes.Value, 0, len(ksids))
	for _, ksid := range ksids {
		values = append(values, sqltypes.MakeTrusted(sqltypes.VarBinary, ksid))
	}
	return values
}

//====================================================================

// LookupUnique defines a vindex that uses a lookup table.
// The table is expected to define the id column as unique. It's
// Unique and a Lookup.
type LookupUnique struct {
	name      string
	writeOnly bool
	lkp       lookupInternal
	encoder   ValueEncoderFunc
}

// NewLookupUnique creates a LookupUnique vindex.
// The supplied map has the following required fields:
//   table: name of the backing table. It can be qualified by the keyspace.
//   from: list of columns in the table that have the 'from' values of the lookup vindex.
//   to: The 'to' column name of the table.
//
// The following fields are optional:
//   autocommit: setting this to "true" will cause deletes to be ignored.
//   write_only: in this mode, Map functions return the full keyrange causing a full scatter.
func NewLookupUnique(name string, m map[string]string) (Vindex, error) {
	lu := &LookupUnique{name: name, encoder: nil}

	autocommit, err := boolFromMap(m, "autocommit")
	if err != nil {
		return nil, err
	}
	lu.writeOnly, err = boolFromMap(m, "write_only")
	if err != nil {
		return nil, err
	}

	encoderName, hasEncoder := m["encoder"]
	if hasEncoder {
		encoder, ok := valueEncoders[encoderName]
		if !ok {
			return nil, fmt.Errorf("vindex %s references unknown value encoder %s", name, encoderName)
		}
		lu.encoder = encoder
	}

	// Don't allow upserts for unique vindexes.
	if err := lu.lkp.Init(m, autocommit, false /* upsert */); err != nil {
		return nil, err
	}
	return lu, nil
}

// String returns the name of the vindex.
func (lu *LookupUnique) String() string {
	return lu.name
}

// Cost returns the cost of this vindex as 10.
func (lu *LookupUnique) Cost() int {
	return 10
}

// IsUnique returns true since the Vindex is unique.
func (lu *LookupUnique) IsUnique() bool {
	return true
}

// NeedsVCursor satisfies the Vindex interface.
func (lu *LookupUnique) NeedsVCursor() bool {
	return true
}

// Map can map ids to key.Destination objects.
func (lu *LookupUnique) Map(vcursor VCursor, ids []sqltypes.Value) ([]key.Destination, error) {
	out := make([]key.Destination, 0, len(ids))
	if lu.writeOnly {
		for range ids {
			out = append(out, key.DestinationKeyRange{KeyRange: &topodatapb.KeyRange{}})
		}
		return out, nil
	}
	results, err := lu.lkp.Lookup(vcursor, ids)
	if err != nil {
		return nil, err
	}
	for i, result := range results {
		switch len(result.Rows) {
		case 0:
			out = append(out, key.DestinationNone{})
		case 1:
			value := result.Rows[0][0]
			if lu.encoder != nil {
				encodedBytes, err := lu.encoder(value)
				if err != nil {
					return nil, fmt.Errorf("Lookup.Map: couldn't apply encoding: %v", err)
				}
				out = append(out, key.DestinationKeyspaceID(encodedBytes))
			} else {
				out = append(out, key.DestinationKeyspaceID(value.ToBytes()))
			}
		default:
			return nil, fmt.Errorf("Lookup.Map: unexpected multiple results from vindex %s: %v", lu.lkp.Table, ids[i])
		}
	}
	return out, nil
}

// Verify returns true if ids maps to ksids.
func (lu *LookupUnique) Verify(vcursor VCursor, ids []sqltypes.Value, ksids [][]byte) ([]bool, error) {
	if lu.writeOnly {
		out := make([]bool, len(ids))
		for i := range ids {
			out[i] = true
		}
		return out, nil
	}
	return lu.lkp.Verify(vcursor, ids, ksidsToValues(ksids))
}

// Create reserves the id by inserting it into the vindex table.
func (lu *LookupUnique) Create(vcursor VCursor, rowsColValues [][]sqltypes.Value, ksids [][]byte, ignoreMode bool) error {
	return lu.lkp.Create(vcursor, rowsColValues, ksidsToValues(ksids), ignoreMode)
}

// Update updates the entry in the vindex table.
func (lu *LookupUnique) Update(vcursor VCursor, oldValues []sqltypes.Value, ksid []byte, newValues []sqltypes.Value) error {
	return lu.lkp.Update(vcursor, oldValues, ksid, sqltypes.MakeTrusted(sqltypes.VarBinary, ksid), newValues)
}

// Delete deletes the entry from the vindex table.
func (lu *LookupUnique) Delete(vcursor VCursor, rowsColValues [][]sqltypes.Value, ksid []byte) error {
	return lu.lkp.Delete(vcursor, rowsColValues, sqltypes.MakeTrusted(sqltypes.VarBinary, ksid), vtgatepb.CommitOrder_NORMAL)
}

// MarshalJSON returns a JSON representation of LookupUnique.
func (lu *LookupUnique) MarshalJSON() ([]byte, error) {
	return json.Marshal(lu.lkp)
}

func numericUint64(input sqltypes.Value) ([]byte, error) {
	// If attempting to cherry-pick this into a build <= 6.0 this needs to be
	// rewritten as sqltypes.ToUint64
	v, err := evalengine.ToUint64(input)
	if err != nil {
		return nil, fmt.Errorf("numericUint64: couldn't parse bytes: %v", err)
	}
	vBytes := make([]byte, 8)
	binary.LittleEndian.PutUint64(vBytes, v)
	return vBytes, nil
}
