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
	"testing"

	jsondiff "github.com/yudai/gojsondiff"
	"github.com/yudai/gojsondiff/formatter"
)

func testExplain(sqlStr, expected string, t *testing.T) {
	plans, err := Run(sqlStr)
	if err != nil {
		t.Fatalf("vtexplain error: %v", err)
	}
	if plans == nil {
		t.Fatalf("vtexplain error running %s: no plan", sqlStr)
	}

	planJson, err := json.MarshalIndent(plans, "", "    ")
	if err != nil {
		t.Error(err)
	}

	var gotArray, wantArray []interface{}
	err = json.Unmarshal(planJson, &gotArray)
	if err != nil {
		t.Fatalf("json unmarshal: %v", err)
	}

	err = json.Unmarshal([]byte(expected), &wantArray)
	if err != nil {
		t.Fatalf("json unmarshal: %v", err)
	}

	d := jsondiff.New().CompareArrays(gotArray, wantArray)

	if d.Modified() {
		config := formatter.AsciiFormatterConfig{}
		formatter := formatter.NewAsciiFormatter(wantArray, config)
		diffString, _ := formatter.Format(d)
		t.Logf("ERROR: got %s...", string(planJson))
		t.Errorf("json diff: %s", diffString)
	}
}

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
create table t1 (
  id bigint(20) unsigned not null,
  val bigint(20) unsigned not null default 0,
  primary key (id)
);

create table user (
  id bigint,
  name varchar(64),
  primary key (id)
) Engine=InnoDB;

create table name_user_map (
  name varchar(64),
  user_id bigint,
  primary key (name, user_id)
) Engine=InnoDB;

create table music (
  user_id bigint,
  id bigint,
  song varchar(64),
  primary key (user_id, id)
) Engine=InnoDB;
`

func init() {
	Init(testVSchemaStr, testSchemaStr)
}

func TestUnsharded(t *testing.T) {
	sqlStr := `
select * from t1;
insert into t1 (id,val) values (1,2);
update t1 set val = 10;
delete from t1 where id = 100;
insert into t1 (id,val) values (1,2) on duplicate key update val=3;
`
	expected := `[
    {
        "Sql": "select * from t1",
        "Plans": [
            {
                "Original": "select * from t1",
                "Instructions": {
                    "Opcode": "SelectUnsharded",
                    "Keyspace": {
                        "Name": "ks_unsharded",
                        "Sharded": false
                    },
                    "Query": "select * from t1",
                    "FieldQuery": "select * from t1 where 1 != 1"
                }
            }
        ],
        "TabletQueries": {
            "ks_unsharded/-": [
                {
                    "Sql": "select * from t1",
                    "BindVars": {
                        "#maxLimit": "type:INT64 value:\"10001\" "
                    },
                    "MysqlQueries": [
                        "select * from t1 limit 10001"
                    ]
                }
            ]
        }
    },
    {
        "Sql": "insert into t1 (id,val) values (1,2)",
        "Plans": [
            {
                "Original": "insert into t1 (id,val) values (1,2)",
                "Instructions": {
                    "Opcode": "InsertUnsharded",
                    "Keyspace": {
                        "Name": "ks_unsharded",
                        "Sharded": false
                    },
                    "Query": "insert into t1(id, val) values (1, 2)",
                    "Table": "t1"
                }
            }
        ],
        "TabletQueries": {
            "ks_unsharded/-": [
                {
                    "Sql": "insert into t1(id, val) values (1, 2)",
                    "BindVars": {
                        "#maxLimit": "type:INT64 value:\"10001\" "
                    },
                    "MysqlQueries": [
                        "begin",
                        "insert into t1(id, val) values (1, 2)",
                        "commit"
                    ]
                }
            ]
        }
    },
    {
        "Sql": "update t1 set val = 10",
        "Plans": [
            {
                "Original": "update t1 set val = 10",
                "Instructions": {
                    "Opcode": "UpdateUnsharded",
                    "Keyspace": {
                        "Name": "ks_unsharded",
                        "Sharded": false
                    },
                    "Query": "update t1 set val = 10"
                }
            }
        ],
        "TabletQueries": {
            "ks_unsharded/-": [
                {
                    "Sql": "update t1 set val = 10",
                    "BindVars": {
                        "#maxLimit": "type:INT64 value:\"10001\" "
                    },
                    "MysqlQueries": [
                        "begin",
                        "select id from t1 limit 10001 for update",
                        "commit"
                    ]
                }
            ]
        }
    },
    {
        "Sql": "delete from t1 where id = 100",
        "Plans": [
            {
                "Original": "delete from t1 where id = 100",
                "Instructions": {
                    "Opcode": "DeleteUnsharded",
                    "Keyspace": {
                        "Name": "ks_unsharded",
                        "Sharded": false
                    },
                    "Query": "delete from t1 where id = 100"
                }
            }
        ],
        "TabletQueries": {
            "ks_unsharded/-": [
                {
                    "Sql": "delete from t1 where id = 100",
                    "BindVars": {
                        "#maxLimit": "type:INT64 value:\"10001\" "
                    },
                    "MysqlQueries": [
                        "begin",
                        "delete from t1 where id in (100)",
                        "commit"
                    ]
                }
            ]
        }
    },
    {
        "Sql": "insert into t1 (id,val) values (1,2) on duplicate key update val=3",
        "Plans": [
            {
                "Original": "insert into t1 (id,val) values (1,2) on duplicate key update val=3",
                "Instructions": {
                    "Opcode": "InsertUnsharded",
                    "Keyspace": {
                        "Name": "ks_unsharded",
                        "Sharded": false
                    },
                    "Query": "insert into t1(id, val) values (1, 2) on duplicate key update val = 3",
                    "Table": "t1"
                }
            }
        ],
        "TabletQueries": {
            "ks_unsharded/-": [
                {
                    "Sql": "insert into t1(id, val) values (1, 2) on duplicate key update val = 3",
                    "BindVars": {
                        "#maxLimit": "type:INT64 value:\"10001\" "
                    },
                    "MysqlQueries": [
                        "begin",
                        "insert into t1(id, val) values (1, 2) on duplicate key update val = 3",
                        "commit"
                    ]
                }
            ]
        }
    }
]`
	testExplain(sqlStr, expected, t)
}

func TestSelectSharded(t *testing.T) {
	sqlStr := `
select * from user /* scatter */;
select * from user where id = 1 /* equal unique */;
select * from user where name = 'bob' /* vindex lookup */;
`
	expected := `
[
    {
        "Sql": "select * from user /* scatter */",
        "Plans": [
            {
                "Original": "select * from user",
                "Instructions": {
                    "Opcode": "SelectScatter",
                    "Keyspace": {
                        "Name": "ks_sharded",
                        "Sharded": true
                    },
                    "Query": "select * from user",
                    "FieldQuery": "select * from user where 1 != 1"
                }
            }
        ],
        "TabletQueries": {
            "ks_sharded/-80": [
                {
                    "Sql": "select * from user /* scatter */",
                    "BindVars": {
                        "#maxLimit": "type:INT64 value:\"10001\" "
                    },
                    "MysqlQueries": [
                        "select * from user limit 10001"
                    ]
                }
            ],
            "ks_sharded/80-": [
                {
                    "Sql": "select * from user /* scatter */",
                    "BindVars": {
                        "#maxLimit": "type:INT64 value:\"10001\" "
                    },
                    "MysqlQueries": [
                        "select * from user limit 10001"
                    ]
                }
            ]
        }
    },
    {
        "Sql": "select * from user where id = 1 /* equal unique */",
        "Plans": [
            {
                "Original": "select * from user where id = 1",
                "Instructions": {
                    "Opcode": "SelectEqualUnique",
                    "Keyspace": {
                        "Name": "ks_sharded",
                        "Sharded": true
                    },
                    "Query": "select * from user where id = 1",
                    "FieldQuery": "select * from user where 1 != 1",
                    "Vindex": "hash",
                    "Values": [
                        1
                    ]
                }
            }
        ],
        "TabletQueries": {
            "ks_sharded/-80": [
                {
                    "Sql": "select * from user where id = 1 /* equal unique */",
                    "BindVars": {
                        "#maxLimit": "type:INT64 value:\"10001\" "
                    },
                    "MysqlQueries": [
                        "select * from user where id = 1 limit 10001"
                    ]
                }
            ]
        }
    },
    {
        "Sql": "select * from user where name = 'bob' /* vindex lookup */",
        "Plans": [
            {
                "Original": "select user_id from name_user_map where name = :name",
                "Instructions": {
                    "Opcode": "SelectEqualUnique",
                    "Keyspace": {
                        "Name": "ks_sharded",
                        "Sharded": true
                    },
                    "Query": "select user_id from name_user_map where name = :name",
                    "FieldQuery": "select user_id from name_user_map where 1 != 1",
                    "Vindex": "md5",
                    "Values": [
                        ":name"
                    ]
                }
            },
            {
                "Original": "select * from user where name = 'bob'",
                "Instructions": {
                    "Opcode": "SelectEqual",
                    "Keyspace": {
                        "Name": "ks_sharded",
                        "Sharded": true
                    },
                    "Query": "select * from user where name = 'bob'",
                    "FieldQuery": "select * from user where 1 != 1",
                    "Vindex": "name_user_map",
                    "Values": [
                        "bob"
                    ]
                }
            }
        ],
        "TabletQueries": {
            "ks_sharded/-80": [
                {
                    "Sql": "select * from user where name = 'bob' /* vindex lookup */",
                    "BindVars": {
                        "#maxLimit": "type:INT64 value:\"10001\" "
                    },
                    "MysqlQueries": [
                        "select * from user where name = 'bob' limit 10001"
                    ]
                }
            ],
            "ks_sharded/80-": [
                {
                    "Sql": "select user_id from name_user_map where name = :name /* vindex lookup */",
                    "BindVars": {
                        "#maxLimit": "type:INT64 value:\"10001\" ",
                        "name": "type:VARBINARY value:\"bob\" "
                    },
                    "MysqlQueries": [
                        "select user_id from name_user_map where name = 'bob' limit 10001"
                    ]
                }
            ]
        }
    }
]
`

	testExplain(sqlStr, expected, t)
}

func TestInsertSharded(t *testing.T) {
	sqlStr := `
insert into user (id, name) values(1, "alice");
insert into user (id, name) values(2, "bob");
insert ignore into user (id, name) values(2, "bob");
`

	expected := `
[
    {
        "Sql": "insert into user (id, name) values(1, \"alice\")",
        "Plans": [
            {
                "Original": "insert into name_user_map(name,user_id) values(:name0,:user_id0)",
                "Instructions": {
                    "Opcode": "InsertSharded",
                    "Keyspace": {
                        "Name": "ks_sharded",
                        "Sharded": true
                    },
                    "Query": "insert into name_user_map(name, user_id) values (:_name0, :user_id0)",
                    "Values": [
                        [
                            ":name0"
                        ]
                    ],
                    "Table": "name_user_map",
                    "Prefix": "insert into name_user_map(name, user_id) values ",
                    "Mid": [
                        "(:_name0, :user_id0)"
                    ]
                }
            },
            {
                "Original": "insert into user (id, name) values(1, \"alice\")",
                "Instructions": {
                    "Opcode": "InsertSharded",
                    "Keyspace": {
                        "Name": "ks_sharded",
                        "Sharded": true
                    },
                    "Query": "insert into user(id, name) values (:_id0, :_name0)",
                    "Values": [
                        [
                            1
                        ],
                        [
                            "alice"
                        ]
                    ],
                    "Table": "user",
                    "Prefix": "insert into user(id, name) values ",
                    "Mid": [
                        "(:_id0, :_name0)"
                    ]
                }
            }
        ],
        "TabletQueries": {
            "ks_sharded/-80": [
                {
                    "Sql": "insert into name_user_map(name, user_id) values (:_name0, :user_id0) /* vtgate:: keyspace_id:475e26c086f437f36bd72ecd883504a7 */",
                    "BindVars": {
                        "#maxLimit": "type:INT64 value:\"10001\" ",
                        "_name0": "type:VARBINARY value:\"alice\" ",
                        "name0": "type:VARBINARY value:\"alice\" ",
                        "user_id0": "type:UINT64 value:\"1\" "
                    },
                    "MysqlQueries": [
                        "begin",
                        "insert into name_user_map(name, user_id) values ('alice', 1)",
                        "commit"
                    ]
                },
                {
                    "Sql": "insert into user(id, name) values (:_id0, :_name0) /* vtgate:: keyspace_id:166b40b44aba4bd6 */",
                    "BindVars": {
                        "#maxLimit": "type:INT64 value:\"10001\" ",
                        "_id0": "type:INT64 value:\"1\" ",
                        "_name0": "type:VARBINARY value:\"alice\" "
                    },
                    "MysqlQueries": [
                        "begin",
                        "insert into user(id, name) values (1, 'alice')",
                        "commit"
                    ]
                }
            ]
        }
    },
    {
        "Sql": "insert into user (id, name) values(2, \"bob\")",
        "Plans": [
            {
                "Original": "insert into name_user_map(name,user_id) values(:name0,:user_id0)",
                "Instructions": {
                    "Opcode": "InsertSharded",
                    "Keyspace": {
                        "Name": "ks_sharded",
                        "Sharded": true
                    },
                    "Query": "insert into name_user_map(name, user_id) values (:_name0, :user_id0)",
                    "Values": [
                        [
                            ":name0"
                        ]
                    ],
                    "Table": "name_user_map",
                    "Prefix": "insert into name_user_map(name, user_id) values ",
                    "Mid": [
                        "(:_name0, :user_id0)"
                    ]
                }
            },
            {
                "Original": "insert into user (id, name) values(2, \"bob\")",
                "Instructions": {
                    "Opcode": "InsertSharded",
                    "Keyspace": {
                        "Name": "ks_sharded",
                        "Sharded": true
                    },
                    "Query": "insert into user(id, name) values (:_id0, :_name0)",
                    "Values": [
                        [
                            2
                        ],
                        [
                            "bob"
                        ]
                    ],
                    "Table": "user",
                    "Prefix": "insert into user(id, name) values ",
                    "Mid": [
                        "(:_id0, :_name0)"
                    ]
                }
            }
        ],
        "TabletQueries": {
            "ks_sharded/-80": [
                {
                    "Sql": "insert into user(id, name) values (:_id0, :_name0) /* vtgate:: keyspace_id:06e7ea22ce92708f */",
                    "BindVars": {
                        "#maxLimit": "type:INT64 value:\"10001\" ",
                        "_id0": "type:INT64 value:\"2\" ",
                        "_name0": "type:VARBINARY value:\"bob\" "
                    },
                    "MysqlQueries": [
                        "begin",
                        "insert into user(id, name) values (2, 'bob')",
                        "commit"
                    ]
                }
            ],
            "ks_sharded/80-": [
                {
                    "Sql": "insert into name_user_map(name, user_id) values (:_name0, :user_id0) /* vtgate:: keyspace_id:da8a82595aa28154c17717955ffeed8b */",
                    "BindVars": {
                        "#maxLimit": "type:INT64 value:\"10001\" ",
                        "_name0": "type:VARBINARY value:\"bob\" ",
                        "name0": "type:VARBINARY value:\"bob\" ",
                        "user_id0": "type:UINT64 value:\"2\" "
                    },
                    "MysqlQueries": [
                        "begin",
                        "insert into name_user_map(name, user_id) values ('bob', 2)",
                        "commit"
                    ]
                }
            ]
        }
    },
    {
        "Sql": "insert ignore into user (id, name) values(2, \"bob\")",
        "Plans": [
            {
                "Original": "insert into name_user_map(name,user_id) values(:name0,:user_id0)",
                "Instructions": {
                    "Opcode": "InsertSharded",
                    "Keyspace": {
                        "Name": "ks_sharded",
                        "Sharded": true
                    },
                    "Query": "insert into name_user_map(name, user_id) values (:_name0, :user_id0)",
                    "Values": [
                        [
                            ":name0"
                        ]
                    ],
                    "Table": "name_user_map",
                    "Prefix": "insert into name_user_map(name, user_id) values ",
                    "Mid": [
                        "(:_name0, :user_id0)"
                    ]
                }
            },
            {
                "Original": "insert ignore into user (id, name) values(2, \"bob\")",
                "Instructions": {
                    "Opcode": "InsertSharded",
                    "Keyspace": {
                        "Name": "ks_sharded",
                        "Sharded": true
                    },
                    "Query": "insert ignore into user(id, name) values (:_id0, :_name0)",
                    "Values": [
                        [
                            2
                        ],
                        [
                            "bob"
                        ]
                    ],
                    "Table": "user",
                    "Prefix": "insert ignore into user(id, name) values ",
                    "Mid": [
                        "(:_id0, :_name0)"
                    ]
                }
            }
        ],
        "TabletQueries": {
            "ks_sharded/-80": [
                {
                    "Sql": "insert ignore into user(id, name) values (:_id0, :_name0) /* vtgate:: keyspace_id:06e7ea22ce92708f */",
                    "BindVars": {
                        "#maxLimit": "type:INT64 value:\"10001\" ",
                        "_id0": "type:INT64 value:\"2\" ",
                        "_name0": "type:VARBINARY value:\"bob\" "
                    },
                    "MysqlQueries": [
                        "begin",
                        "insert ignore into user(id, name) values (2, 'bob')",
                        "commit"
                    ]
                }
            ],
            "ks_sharded/80-": [
                {
                    "Sql": "insert into name_user_map(name, user_id) values (:_name0, :user_id0) /* vtgate:: keyspace_id:da8a82595aa28154c17717955ffeed8b */",
                    "BindVars": {
                        "#maxLimit": "type:INT64 value:\"10001\" ",
                        "_name0": "type:VARBINARY value:\"bob\" ",
                        "name0": "type:VARBINARY value:\"bob\" ",
                        "user_id0": "type:UINT64 value:\"2\" "
                    },
                    "MysqlQueries": [
                        "begin",
                        "insert into name_user_map(name, user_id) values ('bob', 2)",
                        "commit"
                    ]
                }
            ]
        }
    }
]
`
	testExplain(sqlStr, expected, t)
}
