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

// Package mysqlproxy is a simple interface used for executing queries to a
// queryservice with session management for transactions
package mysqlproxy

import (
	"context"
	"fmt"

	"github.com/youtube/vitess/go/sqltypes"
	"github.com/youtube/vitess/go/vt/sqlparser"
	"github.com/youtube/vitess/go/vt/vttablet/queryservice"

	querypb "github.com/youtube/vitess/go/vt/proto/query"
)

// ProxySession holds session state for the proxy
type ProxySession struct {
	TransactionID int64
	TargetString  string
	Options       *querypb.ExecuteOptions
}

// Proxy wraps the standalone query service
type Proxy struct {
	target    *querypb.Target
	qs        queryservice.QueryService
	normalize bool
}

// NewProxy creates a new proxy
func NewProxy(target *querypb.Target, qs queryservice.QueryService, normalize bool) *Proxy {
	return &Proxy{
		target:    target,
		qs:        qs,
		normalize: normalize,
	}
}

// Execute runs the given sql query in the specified session
func (mp *Proxy) Execute(ctx context.Context, session *ProxySession, sql string, bindVariables map[string]*querypb.BindVariable) (*ProxySession, *sqltypes.Result, error) {
	var err error
	result := &sqltypes.Result{}

	switch sqlparser.Preview(sql) {
	case sqlparser.StmtBegin:
		err = mp.Begin(ctx, session)
	case sqlparser.StmtCommit:
		err = mp.Commit(ctx, session)
	case sqlparser.StmtRollback:
		err = mp.Rollback(ctx, session)
	default:
		result, err = mp.doExecute(ctx, session, sql, bindVariables)
	}

	if err != nil {
		return nil, nil, err
	}

	return session, result, nil
}

// Begin starts a new transaction in the current session
func (mp *Proxy) Begin(ctx context.Context, session *ProxySession) error {
	txID, err := mp.qs.Begin(ctx, mp.target, session.Options)
	if err != nil {
		return err
	}
	session.TransactionID = txID
	return nil
}

// Commit commits the in-flight transaction (if any).
func (mp *Proxy) Commit(ctx context.Context, session *ProxySession) error {
	if session.TransactionID == 0 {
		return fmt.Errorf("commit: no open transaction")

	}
	err := mp.qs.Commit(ctx, mp.target, session.TransactionID)
	session.TransactionID = 0
	return err
}

// Rollback rolls back the session
func (mp *Proxy) Rollback(ctx context.Context, session *ProxySession) error {
	if session.TransactionID != 0 {
		err := mp.qs.Rollback(ctx, mp.target, session.TransactionID)
		session.TransactionID = 0
		return err
	}
	return nil
}

// doExecute runs the given query
func (mp *Proxy) doExecute(ctx context.Context, session *ProxySession, sql string, bindVariables map[string]*querypb.BindVariable) (*sqltypes.Result, error) {
	if mp.normalize {
		query, comments := sqlparser.SplitTrailingComments(sql)
		stmt, err := sqlparser.Parse(query)
		if err != nil {
			return nil, err
		}
		sqlparser.Normalize(stmt, bindVariables, "vtp")
		normalized := sqlparser.String(stmt)
		sql = normalized + comments
	}

	return mp.qs.Execute(ctx, mp.target, sql, bindVariables, session.TransactionID, session.Options)
}
