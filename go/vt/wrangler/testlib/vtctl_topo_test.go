/*
Copyright 2017 Google Inc.

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

package testlib

import (
	"encoding/hex"
	"encoding/json"
	"fmt"
	"io/ioutil"
	"os"
	"path"
	"strings"
	"testing"

	"golang.org/x/net/context"

	"github.com/golang/protobuf/jsonpb"

	"github.com/golang/protobuf/proto"
	"vitess.io/vitess/go/vt/topo/memorytopo"

	topodatapb "vitess.io/vitess/go/vt/proto/topodata"
)

func testVtctlTopoCommand(t *testing.T, vp *VtctlPipe, args []string, want string) {
	got, err := vp.RunAndOutput(args)
	if err != nil {
		t.Fatalf("testVtctlTopoCommand(%v) failed: %v", args, err)
	}

	// Remove the variable version numbers.
	lines := strings.Split(got, "\n")
	for i, line := range lines {
		if vi := strings.Index(line, "version="); vi != -1 {
			lines[i] = line[:vi+8] + "V"
		}
	}
	got = strings.Join(lines, "\n")
	if got != want {
		t.Errorf("testVtctlTopoCommand(%v) failed: got:\n%vwant:\n%v", args, got, want)
	}
}

// TestVtctlTopoCommands tests all vtctl commands from the
// "Topo" group.
func TestVtctlTopoCommands(t *testing.T) {
	ts := memorytopo.NewServer("cell1", "cell2")
	if err := ts.CreateKeyspace(context.Background(), "ks1", &topodatapb.Keyspace{ShardingColumnName: "col1"}); err != nil {
		t.Fatalf("CreateKeyspace() failed: %v", err)
	}
	if err := ts.CreateKeyspace(context.Background(), "ks2", &topodatapb.Keyspace{ShardingColumnName: "col2"}); err != nil {
		t.Fatalf("CreateKeyspace() failed: %v", err)
	}

	originalShardInfo, err := ts.GetOrCreateShard(context.Background(), "ks2", "-80")
	if err != nil {
		t.Fatalf("GetOrCreateShard() failed: %v", err)
	}
	fmt.Printf("%v", originalShardInfo)

	vp := NewVtctlPipe(t, ts)
	defer vp.Close()

	tmp, err := ioutil.TempDir("", "vtctltopotest")
	if err != nil {
		t.Fatalf("TempDir failed: %v", err)
	}
	defer os.RemoveAll(tmp)

	// Test TopoCat.
	testVtctlTopoCommand(t, vp, []string{"TopoCat", "-long", "-decode_proto", "/keyspaces/*/Keyspace"}, `path=/keyspaces/ks1/Keyspace version=V
sharding_column_name: "col1"
path=/keyspaces/ks2/Keyspace version=V
sharding_column_name: "col2"
`)

	// Test TopoCp from topo to disk.
	ksFile := path.Join(tmp, "Keyspace")
	_, err = vp.RunAndOutput([]string{"TopoCp", "/keyspaces/ks1/Keyspace", ksFile})
	if err != nil {
		t.Fatalf("TopoCp(/keyspaces/ks1/Keyspace) failed: %v", err)
	}
	contents, err := ioutil.ReadFile(ksFile)
	if err != nil {
		t.Fatalf("copy failed: %v", err)
	}
	expected := &topodatapb.Keyspace{ShardingColumnName: "col1"}
	got := &topodatapb.Keyspace{}
	if err = proto.Unmarshal(contents, got); err != nil {
		t.Fatalf("bad keyspace data %v", err)
	}
	if !proto.Equal(got, expected) {
		t.Fatalf("bad proto data: Got %v expected %v", got, expected)
	}

	// Test TopoCp from disk to topo.
	_, err = vp.RunAndOutput([]string{"TopoCp", "-to_topo", ksFile, "/keyspaces/ks3/Keyspace"})
	if err != nil {
		t.Fatalf("TopoCp(/keyspaces/ks3/Keyspace) failed: %v", err)
	}
	ks3, err := ts.GetKeyspace(context.Background(), "ks3")
	if err != nil {
		t.Fatalf("copy from disk to topo failed: %v", err)
	}
	if !proto.Equal(ks3.Keyspace, expected) {
		t.Fatalf("copy data to topo failed, got %v expected %v", ks3.Keyspace, expected)
	}

	// let's see what's in topocat
	output, err := vp.RunAndOutput([]string{"topocat", "-decode_proto_json", "keyspaces/ks2/shards/-80/Shard"})
	if err != nil {
		t.Fatalf("%v", err)
	}

	var jsonSlice []interface{}
	json.Unmarshal([]byte(output), &jsonSlice)

	// assert there's at least one record

	marshalled, err := json.Marshal(jsonSlice[0])
	if err != nil {
		t.Fatalf("%v", err)
	}

	var gotShard topodatapb.Shard
	err = jsonpb.UnmarshalString(string(marshalled), &gotShard)
	if err != nil {
		t.Fatalf("couldn't unmarshal json: %v", err)
	}

	if !gotShard.GetIsMasterServing() {
		t.Fatalf("Master is not serving")
	}

	if gotShard.GetKeyRange().GetStart() != nil {
		t.Fatalf("Start of keyrange not empty: %v", hex.Dump(gotShard.GetKeyRange().GetStart()))
	}

	if gotShard.GetKeyRange().GetEnd()[0] != 0x80 {
		t.Fatalf("End of keyrange not 0x80: %v", hex.Dump(gotShard.GetKeyRange().GetEnd()))
	}

	if gotShard.GetMasterAlias() != nil {
		t.Fatalf("Expecting master alias to be nil. Was %v", gotShard.GetMasterAlias())
	}

	// modify shard and post it
	// Test TopoPost from disk to topo.
	_, err = vp.RunAndOutput(
		[]string{
			"TopoPost",
			"shard",
			"keyspaces/ks2/shards/-80/Shard",
			`{"isMasterServing":true,"keyRange":{"end":"gA=="},"masterAlias":{"cell":"us_east_1b","uid":303093047}}`,
		},
	)

	if err != nil {
		t.Fatalf("TopoPost(/keyspaces/ks2/shard/-80/Shard) failed: %v", err)
	}

	// topocat again!
	topocatAgain, err := vp.RunAndOutput([]string{"topocat", "-decode_proto_json", "keyspaces/ks2/shards/-80/Shard"})
	if err != nil {
		t.Fatalf("%v", err)
	}

	var jsonSlice2 []interface{}
	json.Unmarshal([]byte(topocatAgain), &jsonSlice2)

	// assert there's at least one record

	marshalled2, err := json.Marshal(jsonSlice2[0])
	if err != nil {
		t.Fatalf("%v", err)
	}

	var gotShard2 topodatapb.Shard
	err = jsonpb.UnmarshalString(string(marshalled2), &gotShard2)
	if err != nil {
		t.Fatalf("couldn't unmarshal json: %v", err)
	}

	if !gotShard2.GetIsMasterServing() {
		t.Fatalf("Master is not serving")
	}

	if gotShard2.GetKeyRange().GetStart() != nil {
		t.Fatalf("Start of keyrange not empty: %v", hex.Dump(gotShard2.GetKeyRange().GetStart()))
	}

	if gotShard2.GetKeyRange().GetEnd()[0] != 0x80 {
		t.Fatalf("End of keyrange not 0x80: %v", hex.Dump(gotShard2.GetKeyRange().GetEnd()))
	}

	if gotShard2.GetMasterAlias() == nil {
		t.Fatalf("Expecting master alias to not be nil. Was %v", gotShard2.GetMasterAlias())
	}

	if gotShard2.GetMasterAlias().GetCell() != "us_east_1b" {
		t.Fatalf("Expecting master alias to not 'us_east_1b'. Was %v", gotShard2.GetMasterAlias().GetCell())
	}

	if gotShard2.GetMasterAlias().GetUid() != 303093047 {
		t.Fatalf("Expecting master alias to not '303093047'. Was %v", gotShard2.GetMasterAlias().GetUid())
	}
}
