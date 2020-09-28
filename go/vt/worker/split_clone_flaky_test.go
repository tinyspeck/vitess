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

import (
	"errors"
	"vitess.io/vitess/go/sqltypes"

	querypb "vitess.io/vitess/go/vt/proto/query"
)

const (
	// splitCloneTestMin is the minimum value of the primary key.
	splitCloneTestMin int = 100
	// splitCloneTestMax is the maximum value of the primary key.
	splitCloneTestMax int = 200
	// In the default test case there are 100 rows on the source.
	splitCloneTestRowsCount = splitCloneTestMax - splitCloneTestMin
)

var errReadOnly = errors.New("the MariaDB server is running with the --read-only option so it cannot execute this statement (errno 1290) during query: ")

// v3Fields is identical to v2Fields but lacks the "keyspace_id" column.
var v3Fields = []*querypb.Field{
	{
		Name: "id",
		Type: sqltypes.Int64,
	},
	{
		Name: "msg",
		Type: sqltypes.VarChar,
	},
}
