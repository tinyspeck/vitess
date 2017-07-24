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

package vtexplain

import (
	"encoding/json"
	"fmt"
	"testing"
)

var testVSchemaStr = `
{
	"ks_unsharded": {
		"Sharded": false,
		"Tables": {
			"t1": {}
		}
	},
	"ks_sharded": {
		"Sharded": true,
		"vindexes": {
			"music_user_map": {
				"type": "lookup_hash_unique",
				"owner": "music",
				"params": {
					"table": "music_user_map",
					"from": "music_id",
					"to": "user_id"
				}
			},
			"name_user_map": {
				"type": "lookup_hash",
				"owner": "user",
				"params": {
					"table": "name_user_map",
					"from": "name",
					"to": "user_id"
				}
			},
			"hash": {
				"type": "hash"
			},
			"md5": {
				"type": "unicode_loose_md5"
			}
		},
		"tables": {
			"user": {
				"column_vindexes": [
					{
						"column": "id",
						"name": "hash"
					},
					{
						"column": "name",
						"name": "name_user_map"
					}
				]
			},
			"music": {
				"column_vindexes": [
					{
						"column": "user_id",
						"name": "hash"
					},
					{
						"column": "id",
						"name": "music_user_map"
					}
				]
			},
			"name_user_map": {
				"column_vindexes": [
					{
						"column": "name",
						"name": "md5"
					}
				]
			}
		}
	}
}
`

var testSchemaStr = `
CREATE TABLE t1 (
  id bigint(20) unsigned NOT NULL,
  val bigint(20) unsigned NOT NULL,
  PRIMARY KEY (id)
);
`

func init() {
	Init(testVSchemaStr)
}

func TestUnsharded(t *testing.T) {
	sqlStr := `
select * from t1;
insert into t1 (id,val) values (1,2);
update t1 set val = 10;
delete from t1 where id = 100;
insert into t1 (id,val) values (1,2) on duplicate key update val=3 /* vtexplain: update */ ;
`

	plans, err := Run(sqlStr, testSchemaStr)
	if err != nil {
		t.Error(err)
	}
	if plans == nil {
		t.Error("no plan")
	}

	planJson, err := json.MarshalIndent(plans, "", "    ")
	if err != nil {
		t.Error(err)
	}
	fmt.Println(string(planJson))
}

func TestSelectScatter(t *testing.T) {
	schemaStr := ""

	sqlStr := `
select * from user;
select * from music where user_id = 1;
`

	plans, err := Run(sqlStr, schemaStr)
	if err != nil {
		t.Error(err)
	}
	if plans == nil {
		t.Error("no plan")
	}

	planJson, err := json.MarshalIndent(plans, "", "    ")
	if err != nil {
		t.Error(err)
	}
	fmt.Println(string(planJson))
}

func TestInsertSharded(t *testing.T) {
	schemaStr := ""

	sqlStr := `
insert into user (id, name) values(1, "alice");
insert into user (id, name) values(2, "bob");
insert ignore into user (id, name) values(2, "bob");
`

	plans, err := Run(sqlStr, schemaStr)
	if err != nil {
		t.Error(err)
	}
	if plans == nil {
		t.Error("no plan")
	}

	planJson, err := json.MarshalIndent(plans, "", "    ")
	if err != nil {
		t.Error(err)
	}
	fmt.Println(string(planJson))
}
