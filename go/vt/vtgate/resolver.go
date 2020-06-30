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

package vtgate

import (
	"strings"

	"golang.org/x/net/context"
	"vitess.io/vitess/go/sqltypes"
	"vitess.io/vitess/go/vt/key"
	"vitess.io/vitess/go/vt/log"
	querypb "vitess.io/vitess/go/vt/proto/query"
	topodatapb "vitess.io/vitess/go/vt/proto/topodata"
	vtrpcpb "vitess.io/vitess/go/vt/proto/vtrpc"
	"vitess.io/vitess/go/vt/srvtopo"
	"vitess.io/vitess/go/vt/vterrors"
)

// Resolver is the layer to resolve KeyspaceIds and KeyRanges
// to shards. It will try to re-resolve shards if ScatterConn
// returns retryable error, which may imply horizontal or vertical
// resharding happened. It is implemented using a srvtopo.Resolver.
type Resolver struct {
	scatterConn *ScatterConn
	resolver    *srvtopo.Resolver
	toposerv    srvtopo.Server
	cell        string
}

// NewResolver creates a new Resolver.
func NewResolver(resolver *srvtopo.Resolver, serv srvtopo.Server, cell string, sc *ScatterConn) *Resolver {
	return &Resolver{
		scatterConn: sc,
		resolver:    resolver,
		toposerv:    serv,
		cell:        cell,
	}
}

// isRetryableError will be true if the error should be retried.
func isRetryableError(err error) bool {
	return vterrors.Code(err) == vtrpcpb.Code_FAILED_PRECONDITION
}

// Execute executes a non-streaming query based on provided destination.
// It retries query if new keyspace/shards are re-resolved after a retryable error.
func (res *Resolver) Execute(
	ctx context.Context,
	sql string,
	bindVars map[string]*querypb.BindVariable,
	keyspace string,
	tabletType topodatapb.TabletType,
	destination key.Destination,
	session *SafeSession,
	notInTransaction bool,
	options *querypb.ExecuteOptions,
	logStats *LogStats,
	canAutocommit bool,
) (*sqltypes.Result, error) {
	rss, err := res.resolver.ResolveDestination(ctx, keyspace, tabletType, destination)
	if err != nil {
		return nil, err
	}
	if logStats != nil {
		logStats.ShardQueries = uint32(len(rss))
	}

	autocommit := len(rss) == 1 && canAutocommit && session.AutocommitApproval()

	for {
		msgs := []string{}
		for _, rs := range rss {
			msgs = append(msgs, rs.Target.String())
		}
		log.Infof("resolved the following targets: %v", strings.Join(msgs, ", "))

		qr, err := res.scatterConn.Execute(
			ctx,
			sql,
			bindVars,
			rss,
			tabletType,
			session,
			notInTransaction,
			options,
			autocommit,
		)
		if isRetryableError(err) {
			log.Infof("retrying Execute due to %v", err)
			newRss, err := res.resolver.ResolveDestination(ctx, keyspace, tabletType, destination)
			if err != nil {
				return nil, err
			}
			if !srvtopo.ResolvedShardsEqual(rss, newRss) {
				// If the mapping to underlying shards changed,
				// we might be resharding. Try again.
				rss = newRss
				continue
			}
		}
		if err != nil {
			log.Infof("got error in resolver.Execute %v", err)
			return nil, err
		}
		return qr, err
	}
}

// StreamExecute executes a streaming query on shards resolved by given func.
// This function currently temporarily enforces the restriction of executing on
// one shard since it cannot merge-sort the results to guarantee ordering of
// response which is needed for checkpointing.
// Note we guarantee the callback will not be called concurrently
// by multiple go routines.
func (res *Resolver) StreamExecute(
	ctx context.Context,
	sql string,
	bindVars map[string]*querypb.BindVariable,
	keyspace string,
	tabletType topodatapb.TabletType,
	destination key.Destination,
	options *querypb.ExecuteOptions,
	callback func(*sqltypes.Result) error,
) error {
	rss, err := res.resolver.ResolveDestination(ctx, keyspace, tabletType, destination)
	if err != nil {
		return err
	}
	err = res.scatterConn.StreamExecute(
		ctx,
		sql,
		bindVars,
		rss,
		tabletType,
		options,
		callback)
	return err
}

// MessageStream streams messages.
func (res *Resolver) MessageStream(ctx context.Context, keyspace string, shard string, keyRange *topodatapb.KeyRange, name string, callback func(*sqltypes.Result) error) error {
	var destination key.Destination
	if shard != "" {
		// If we pass in a shard, resolve the keyspace/shard
		// following redirects.
		destination = key.DestinationShard(shard)
	} else {
		// If we pass in a KeyRange, resolve it to the proper shards.
		// Note we support multiple shards here, we will just aggregate
		// the message streams.
		destination = key.DestinationExactKeyRange{KeyRange: keyRange}
	}
	rss, err := res.resolver.ResolveDestination(ctx, keyspace, topodatapb.TabletType_MASTER, destination)
	if err != nil {
		return err
	}
	return res.scatterConn.MessageStream(ctx, rss, name, callback)
}

// GetGatewayCacheStatus returns a displayable version of the Gateway cache.
func (res *Resolver) GetGatewayCacheStatus() TabletCacheStatusList {
	return res.scatterConn.GetGatewayCacheStatus()
}
