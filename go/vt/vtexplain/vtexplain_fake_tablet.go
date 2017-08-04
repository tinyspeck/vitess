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
	"golang.org/x/net/context"

	"github.com/youtube/vitess/go/mysql"
	"github.com/youtube/vitess/go/mysql/fakesqldb"
	"github.com/youtube/vitess/go/sqltypes"
	"github.com/youtube/vitess/go/vt/dbconfigs"
	"github.com/youtube/vitess/go/vt/mysqlctl"
	"github.com/youtube/vitess/go/vt/vttablet/tabletserver"
	"github.com/youtube/vitess/go/vt/vttablet/tabletserver/tabletenv"

	querypb "github.com/youtube/vitess/go/vt/proto/query"
	topodatapb "github.com/youtube/vitess/go/vt/proto/topodata"
)

func fakeTabletExecute(sql string, bindVars map[string]*querypb.BindVariable) ([]string, error) {
	db := newFakeDB()
	defer db.Close()

	ctx := context.Background()

	// XXX much of this is cloned from the tabletserver tests
	config := tabletenv.DefaultQsConfig
	config.EnableAutoCommit = true
	tsv := tabletserver.NewTabletServerWithNilTopoServer(config)

	dbcfgs := dbconfigs.DBConfigs{
		App:           *db.ConnParams(),
		SidecarDBName: "_vt",
	}
	cnf := mysqlctl.NewMycnf(22222, 6802)
	cnf.ServerID = 33333
	mysqld := mysqlctl.NewMysqld(
		cnf,
		&dbcfgs,
		dbconfigs.AppConfig, // These tests only use the app pool.
	)

	target := querypb.Target{TabletType: topodatapb.TabletType_MASTER}
	tsv.StartService(target, dbcfgs, mysqld)
	defer tsv.StopService()

	logStats := tabletenv.NewLogStats(ctx, "FakeQueryExecutor")
	plan, err := tsv.GetPlan(ctx, logStats, sql)
	if err != nil {
		return nil, err
	}
	txID := int64(0)
	qre := tabletserver.NewQueryExecutor(sql, bindVars, txID, nil, plan, ctx, logStats, tsv)

	queries := make([]string, 0, 4)

	db.QueryLogger = func(query string, result *sqltypes.Result, err error){
		queries = append(queries, query)
	}

	_, err = qre.Execute()
	if err != nil {
		return nil, err
	}

	return queries, nil
}

// Set up the fakesqldb with queries needed to resolve the schema and accept
// all other queries
func newFakeDB() *fakesqldb.DB {
	// XXX passing nil for testing.t?
	db := fakesqldb.New(nil)

	schemaQueries := map[string]*sqltypes.Result {
		"select unix_timestamp()": {
			Fields: []*querypb.Field{{
				Type: sqltypes.Uint64,
			}},
			RowsAffected: 1,
			Rows: [][]sqltypes.Value{
				{sqltypes.MakeTrusted(sqltypes.Int32, []byte("1427325875"))},
			},
		},
		"select @@global.sql_mode": {
			Fields: []*querypb.Field{{
				Type: sqltypes.VarChar,
			}},
			RowsAffected: 1,
			Rows: [][]sqltypes.Value{
				{sqltypes.MakeString([]byte("STRICT_TRANS_TABLES"))},
			},
		},
		"select @@autocommit": {
			Fields: []*querypb.Field{{
				Type: sqltypes.Uint64,
			}},
			RowsAffected: 1,
			Rows: [][]sqltypes.Value{
				{sqltypes.MakeString([]byte("1"))},
			},
		},
		"show variables like 'binlog_format'": {
			Fields: []*querypb.Field{{
				Type: sqltypes.VarChar,
			}, {
				Type: sqltypes.VarChar,
			}},
			RowsAffected: 1,
			Rows: [][]sqltypes.Value{{
				sqltypes.MakeString([]byte("binlog_format")),
				sqltypes.MakeString([]byte("STATEMENT")),
			}},
		},
		mysql.BaseShowTables: {
			Fields:       mysql.BaseShowTablesFields,
			RowsAffected: 1,
			Rows: [][]sqltypes.Value{
				mysql.BaseShowTablesRow("t1", false, ""),
			},
		},
		mysql.BaseShowTablesForTable("t1"): {
			Fields:       mysql.BaseShowTablesFields,
			RowsAffected: 1,
			Rows: [][]sqltypes.Value{
				mysql.BaseShowTablesRow("t1", false, ""),
			},
		},
		"describe t1": {
			Fields:       mysql.DescribeTableFields,
			RowsAffected: 2,
			Rows: [][]sqltypes.Value{
				mysql.DescribeTableRow("id", "int(11)", false, "PRI", "0"),
				mysql.DescribeTableRow("val", "int(11)", false, "", "0"),
			},
		},
		"select * from t1 where 1 != 1": {
			Fields: []*querypb.Field{{
				Name: "id",
				Type: sqltypes.Int32,
			}, {
				Name: "val",
				Type: sqltypes.Int32,
			}},
		},
		// for SplitQuery because it needs a primary key column
		"show index from t1": {
			Fields:       mysql.ShowIndexFromTableFields,
			RowsAffected: 1,
			Rows: [][]sqltypes.Value{
				mysql.ShowIndexFromTableRow("t1", true, "PRIMARY", 1, "id", false),
			},
		},
	}
	for q, r := range schemaQueries {
		db.AddQuery(q, r)
	}

	db.AddQueryPattern(".*", &sqltypes.Result{})

	return db
}
