/*
Copyright 2020 The Vitess Authors.

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

package cluster

import (
	"context"
	"database/sql"
	"fmt"
	"math/rand"
	"strings"
	"sync"
	"time"

	"k8s.io/apimachinery/pkg/util/sets"

	"vitess.io/vitess/go/trace"
	"vitess.io/vitess/go/vt/concurrency"
	"vitess.io/vitess/go/vt/log"
	"vitess.io/vitess/go/vt/logutil"
	"vitess.io/vitess/go/vt/topo/topoproto"
	"vitess.io/vitess/go/vt/vtadmin/cluster/discovery"
	"vitess.io/vitess/go/vt/vtadmin/errors"
	"vitess.io/vitess/go/vt/vtadmin/vtadminproto"
	"vitess.io/vitess/go/vt/vtadmin/vtctldclient"
	"vitess.io/vitess/go/vt/vtadmin/vtsql"

	topodatapb "vitess.io/vitess/go/vt/proto/topodata"
	vtadminpb "vitess.io/vitess/go/vt/proto/vtadmin"
	vtctldatapb "vitess.io/vitess/go/vt/proto/vtctldata"
)

// Cluster is the self-contained unit of services required for vtadmin to talk
// to a vitess cluster. This consists of a discovery service, a database
// connection, and a vtctl client.
type Cluster struct {
	ID        string
	Name      string
	Discovery discovery.Discovery

	DB     vtsql.DB
	Vtctld vtctldclient.Proxy

	// These fields are kept to power debug endpoints.
	// (TODO|@amason): Figure out if these are needed or if there's a way to
	// push down to the credentials / vtsql.
	// vtgateCredentialsPath string
}

// New creates a new Cluster from a Config.
func New(cfg Config) (*Cluster, error) {
	cluster := &Cluster{
		ID:   cfg.ID,
		Name: cfg.Name,
	}

	discoargs := buildPFlagSlice(cfg.DiscoveryFlagsByImpl[cfg.DiscoveryImpl])

	disco, err := discovery.New(cfg.DiscoveryImpl, cluster.ToProto(), discoargs)
	if err != nil {
		return nil, fmt.Errorf("error creating discovery impl (%s): %w", cfg.DiscoveryImpl, err)
	}

	cluster.Discovery = disco

	protocluster := cluster.ToProto()

	vtsqlargs := buildPFlagSlice(cfg.VtSQLFlags)

	vtsqlCfg, err := vtsql.Parse(protocluster, disco, vtsqlargs)
	if err != nil {
		return nil, fmt.Errorf("error creating vtsql connection config: %w", err)
	}

	vtctldargs := buildPFlagSlice(cfg.VtctldFlags)

	vtctldCfg, err := vtctldclient.Parse(protocluster, disco, vtctldargs)
	if err != nil {
		return nil, fmt.Errorf("error creating vtctldclient proxy config: %w", err)
	}

	cluster.DB = vtsql.New(vtsqlCfg)
	cluster.Vtctld = vtctldclient.New(vtctldCfg)

	return cluster, nil
}

// ToProto returns a value-copy protobuf equivalent of the cluster.
func (c Cluster) ToProto() *vtadminpb.Cluster {
	return &vtadminpb.Cluster{
		Id:   c.ID,
		Name: c.Name,
	}
}

func buildPFlagSlice(flags map[string]string) []string {
	args := make([]string, 0, len(flags))
	for k, v := range flags {
		// The k=v syntax is needed to account for negating boolean flags.
		args = append(args, "--"+k+"="+v)
	}

	return args
}

// parseTablets converts a set of *sql.Rows into a slice of Tablets, for the
// given cluster.
func (c *Cluster) parseTablets(rows *sql.Rows) ([]*vtadminpb.Tablet, error) {
	var tablets []*vtadminpb.Tablet

	for rows.Next() {
		if err := rows.Err(); err != nil {
			return nil, err
		}

		tablet, err := c.parseTablet(rows)
		if err != nil {
			return nil, err
		}

		tablets = append(tablets, tablet)
	}

	if err := rows.Err(); err != nil {
		return nil, err
	}

	return tablets, nil
}

// Fields are:
// Cell | Keyspace | Shard | TabletType (string) | ServingState (string) | Alias | Hostname | MasterTermStartTime.
func (c *Cluster) parseTablet(rows *sql.Rows) (*vtadminpb.Tablet, error) {
	var (
		cell            string
		tabletTypeStr   string
		servingStateStr string
		aliasStr        string
		mtstStr         string
		topotablet      topodatapb.Tablet

		err error
	)

	if err := rows.Scan(
		&cell,
		&topotablet.Keyspace,
		&topotablet.Shard,
		&tabletTypeStr,
		&servingStateStr,
		&aliasStr,
		&topotablet.Hostname,
		&mtstStr,
	); err != nil {
		return nil, err
	}

	tablet := &vtadminpb.Tablet{
		Cluster: &vtadminpb.Cluster{
			Id:   c.ID,
			Name: c.Name,
		},
		Tablet: &topotablet,
	}

	topotablet.Type, err = topoproto.ParseTabletType(tabletTypeStr)
	if err != nil {
		return nil, err
	}

	tablet.State = vtadminproto.ParseTabletServingState(servingStateStr)

	topotablet.Alias, err = topoproto.ParseTabletAlias(aliasStr)
	if err != nil {
		return nil, fmt.Errorf("failed to parse tablet_alias %s: %w", aliasStr, err)
	}

	if topotablet.Alias.Cell != cell {
		// (TODO:@amason) ???
		log.Warningf("tablet cell %s does not match alias %s. ignoring for now", cell, topoproto.TabletAliasString(topotablet.Alias))
	}

	if mtstStr != "" {
		timeTime, err := time.Parse(time.RFC3339, mtstStr)
		if err != nil {
			return nil, fmt.Errorf("failed parsing master_term_start_time %s: %w", mtstStr, err)
		}

		topotablet.MasterTermStartTime = logutil.TimeToProto(timeTime)
	}

	return tablet, nil
}

// FindWorkflowsOptions is the set of options for FindWorkflows requests.
type FindWorkflowsOptions struct {
	ActiveOnly      bool
	IgnoreKeyspaces sets.String
	Filter          func(workflow *vtadminpb.Workflow) bool
}

// FindWorkflows returns a list of Workflows in this cluster, across the given
// keyspaces and filtering according to the options passed in.
//
// If the list of keyspaces to check is empty, then FindWorkflows will use the
// result of GetKeyspaces to search all keyspaces in the cluster. In this case,
// opts.IgnoreKeyspaces is respected.
//
// Callers should use this function when they want more fine-grained filtering,
// and GetWorkflows when they just want to filter on keyspace name.
//
// Note that if only a subset of keyspaces error on their vtctld GetWorkflows
// rpc, this is treated as a partial success, and the ClusterWorkflows response
// will include any errors in the Warnings slice. If all keyspaces fail, or if
// non-(Vtctld.GetWorkflows) calls fail, this is treated as an error by this
// function.
func (c *Cluster) FindWorkflows(ctx context.Context, keyspaces []string, opts FindWorkflowsOptions) (*vtadminpb.ClusterWorkflows, error) {
	span, ctx := trace.NewSpan(ctx, "Cluster.FindWorkflows")
	defer span.Finish()

	AnnotateSpan(c, span)
	span.Annotate("active_only", opts.ActiveOnly)

	if err := c.Vtctld.Dial(ctx); err != nil {
		return nil, fmt.Errorf("FindWorkflows(cluster = %v, keyspaces = %v, opts = %v) dial failed: %w", c.ID, keyspaces, opts, err)
	}

	return c.findWorkflows(ctx, keyspaces, opts)
}

func (c *Cluster) findWorkflows(ctx context.Context, keyspaces []string, opts FindWorkflowsOptions) (*vtadminpb.ClusterWorkflows, error) {
	if opts.Filter == nil {
		opts.Filter = func(_ *vtadminpb.Workflow) bool { return true }
	}

	if opts.IgnoreKeyspaces == nil {
		opts.IgnoreKeyspaces = sets.NewString()
	}

	if len(keyspaces) == 0 {
		span, ctx := trace.NewSpan(ctx, "Cluster.GetKeyspaces")
		AnnotateSpan(c, span)

		resp, err := c.Vtctld.GetKeyspaces(ctx, &vtctldatapb.GetKeyspacesRequest{})
		if err != nil {
			span.Finish()
			return nil, fmt.Errorf("GetKeyspaces(cluster = %s) failed: %w", c.ID, err)
		}

		for _, ks := range resp.Keyspaces {
			keyspaces = append(keyspaces, ks.Name)
		}

		span.Finish()
	} else if opts.IgnoreKeyspaces.Len() > 0 {
		log.Warningf("Cluster.findWorkflows: IgnoreKeyspaces was set, but Keyspaces was not empty; ignoring IgnoreKeyspaces in favor of explicitly checking everything in Keyspaces: (%s)", strings.Join(keyspaces, ", "))
		opts.IgnoreKeyspaces = sets.NewString()
	}

	// Annotate the parent span with some additional information about the call.
	if span, _ := trace.FromContext(ctx); span != nil {
		span.Annotate("num_keyspaces", len(keyspaces))
		span.Annotate("keyspaces", strings.Join(keyspaces, ","))
		span.Annotate("num_ignore_keyspaces", opts.IgnoreKeyspaces.Len())
		span.Annotate("ignore_keyspaces", strings.Join(opts.IgnoreKeyspaces.List(), ","))
	}

	clusterpb := c.ToProto()

	var (
		m       sync.Mutex
		wg      sync.WaitGroup
		rec     concurrency.AllErrorRecorder
		results []*vtadminpb.Workflow
	)

	for _, ks := range keyspaces {
		if opts.IgnoreKeyspaces.Has(ks) {
			log.Infof("Cluster.findWorkflows: ignoring keyspace %s", ks)

			continue
		}

		wg.Add(1)

		go func(ks string) {
			defer wg.Done()

			span, ctx := trace.NewSpan(ctx, "Cluster.GetWorkflowsForKeyspace")
			defer span.Finish()

			AnnotateSpan(c, span)
			span.Annotate("keyspace", ks)
			span.Annotate("active_only", opts.ActiveOnly)

			resp, err := c.Vtctld.GetWorkflows(ctx, &vtctldatapb.GetWorkflowsRequest{
				Keyspace:   ks,
				ActiveOnly: opts.ActiveOnly,
			})
			if err != nil {
				err = fmt.Errorf("GetWorkflows(cluster = %s, keyspace = %s, active_only = %v) failed: %w", c.ID, ks, opts.ActiveOnly, err)
				rec.RecordError(err)

				return
			}

			workflows := make([]*vtadminpb.Workflow, 0, len(resp.Workflows))
			for _, wf := range resp.Workflows {
				workflow := &vtadminpb.Workflow{
					Cluster:  clusterpb,
					Keyspace: ks,
					Workflow: wf,
				}

				if opts.Filter(workflow) {
					workflows = append(workflows, workflow)
				}
			}

			m.Lock()
			results = append(results, workflows...)
			m.Unlock()
		}(ks)
	}

	wg.Wait()

	// If every keyspace failed, treat this as an error.
	if rec.HasErrors() && len(rec.Errors) == len(keyspaces) {
		return nil, rec.Error()
	}

	// Otherwise, append any failures into the warnings slice, and return what
	// results we have.
	return &vtadminpb.ClusterWorkflows{
		Workflows: results,
		Warnings:  rec.ErrorStrings(),
	}, nil
}

// GetTablets returns all tablets in the cluster.
func (c *Cluster) GetTablets(ctx context.Context) ([]*vtadminpb.Tablet, error) {
	span, ctx := trace.NewSpan(ctx, "Cluster.GetTablets")
	defer span.Finish()

	AnnotateSpan(c, span)

	return c.getTablets(ctx)
}

func (c *Cluster) getTablets(ctx context.Context) ([]*vtadminpb.Tablet, error) {
	if err := c.DB.Dial(ctx, ""); err != nil {
		return nil, err
	}

	rows, err := c.DB.ShowTablets(ctx)
	if err != nil {
		return nil, err
	}

	return c.parseTablets(rows)
}

// GetSchema returns the schema for a GetSchemaRequest on the given tablet. The
// caller is responsible for making at least one call to c.Vtctld.Dial prior to
// calling this function.
//
// Note that the request's TabletAlias field will be ignored, using the provided
// tablet's Alias instead. This override is done on a copy of the request, so it
// is transparent to the caller.
//
// This function takes both the request argument and tablet argument to
// (a) set the Keyspace field on the resulting Schema object, which comes from
// the provided tablet; and, (b) allow a caller, like vtadmin.API to collect a
// bunch of tablets once and make a series of GetSchema calls without Cluster
// refetching the tablet list each time.
func (c *Cluster) GetSchema(ctx context.Context, req *vtctldatapb.GetSchemaRequest, tablet *vtadminpb.Tablet) (*vtadminpb.Schema, error) {
	span, ctx := trace.NewSpan(ctx, "Cluster.GetSchema")
	defer span.Finish()

	AnnotateSpan(c, span)

	// Copy the request to not mutate the caller's request object.
	r := *req
	r.TabletAlias = tablet.Tablet.Alias

	span.Annotate("tablet_alias", topoproto.TabletAliasString(r.TabletAlias))
	span.Annotate("exclude_tables", strings.Join(r.ExcludeTables, ","))
	span.Annotate("tables", strings.Join(r.Tables, ","))
	span.Annotate("include_views", r.IncludeViews)
	span.Annotate("table_names_only", r.TableNamesOnly)
	span.Annotate("table_sizes_only", r.TableSizesOnly)

	schema, err := c.Vtctld.GetSchema(ctx, &r)
	if err != nil {
		return nil, err
	}

	if schema == nil || schema.Schema == nil {
		return nil, nil
	}

	return &vtadminpb.Schema{
		Cluster:          c.ToProto(),
		Keyspace:         tablet.Tablet.Keyspace,
		TableDefinitions: schema.Schema.TableDefinitions,
	}, nil
}

// GetSchemaOptions blah blah TODO document this.
type GetSchemaOptions struct {
	Tablets     []*vtadminpb.Tablet
	BaseRequest *vtctldatapb.GetSchemaRequest
	SizeOpts    *vtadminpb.GetSchemaTableSizeOptions
}

// GetSchemaForKeyspace blah blah TODO: unify this with GetSchema.
func (c *Cluster) GetSchemaForKeyspace(ctx context.Context, keyspace string, opts GetSchemaOptions) (*vtadminpb.Schema, error) {
	if len(opts.Tablets) == 0 {
		// Fetch all tablets for the keyspace.
		var err error

		opts.Tablets, err = c.FindTablets(ctx, func(tablet *vtadminpb.Tablet) bool {
			return tablet.Tablet.Keyspace == keyspace
		}, -1)
		if err != nil {
			return nil, err
		}
	}

	if opts.SizeOpts == nil {
		opts.SizeOpts = &vtadminpb.GetSchemaTableSizeOptions{
			AggregateSizes:          false,
			IncludeNonServingShards: false,
		}
	}

	if opts.BaseRequest == nil {
		opts.BaseRequest = &vtctldatapb.GetSchemaRequest{}
	}

	var tabletsToQuery []*vtadminpb.Tablet

	if opts.SizeOpts.AggregateSizes {
		resp, err := c.Vtctld.FindAllShardsInKeyspace(ctx, &vtctldatapb.FindAllShardsInKeyspaceRequest{
			Keyspace: keyspace,
		})
		if err != nil {
			return nil, err
		}

		for _, shard := range resp.Shards {
			if !shard.Shard.IsMasterServing {
				if !opts.SizeOpts.IncludeNonServingShards {
					log.Infof("log thing about skipping this shard")
					continue
				}
			}

			shardTablets := vtadminproto.FilterTablets(func(tablet *vtadminpb.Tablet) bool {
				return tablet.Tablet.Shard == shard.Name && tablet.State == vtadminpb.Tablet_SERVING
			}, opts.Tablets, len(opts.Tablets))

			if len(shardTablets) == 0 {
				return nil, fmt.Errorf("no serving tablet for shard %s/%s", shard.Keyspace, shard.Name)
			}

			randomServingTablet := shardTablets[rand.Intn(len(shardTablets))]
			tabletsToQuery = append(tabletsToQuery, randomServingTablet)
		}
	} else {
		keyspaceTablets := vtadminproto.FilterTablets(func(tablet *vtadminpb.Tablet) bool {
			return tablet.Tablet.Keyspace == keyspace && tablet.State == vtadminpb.Tablet_SERVING
		}, opts.Tablets, len(opts.Tablets))

		if len(keyspaceTablets) == 0 {
			// consider how to include info about the tablets we looked at, but
			// that's also potentially a very long list .... maybe we should
			// just log it (yes, do that).
			return nil, fmt.Errorf("no serving tablet for keyspace %s", keyspace)
		}

		randomServingTablet := keyspaceTablets[rand.Intn(len(keyspaceTablets))]
		tabletsToQuery = append(tabletsToQuery, randomServingTablet)
	}

	var (
		m      sync.Mutex
		wg     sync.WaitGroup
		rec    concurrency.AllErrorRecorder
		schema = &vtadminpb.Schema{
			Cluster:    c.ToProto(),
			Keyspace:   keyspace,
			TableSizes: map[string]*vtadminpb.Schema_TableSize{},
		}
		// Instead of starting at false, we start with whatever the base request
		// specified. If we have exactly one tablet to query(i.e. we're no
		// doing multi-shard aggregation), it's possible the request was to
		// literally just get the table sizes; we shouldn't assume. If we have
		// more than one tablet to query, then we are doing size aggregation,
		// and we'll flip this to true after spawning the first GetSchema rpc.
		sizesOnly = opts.BaseRequest.TableSizesOnly
	)

	for _, tablet := range tabletsToQuery {
		wg.Add(1)

		go func(tablet *vtadminpb.Tablet, sizesOnly bool) {
			defer wg.Done()

			req := *opts.BaseRequest
			req.TableSizesOnly = sizesOnly
			req.TabletAlias = tablet.Tablet.Alias

			resp, err := c.Vtctld.GetSchema(ctx, &req)
			if err != nil {
				rec.RecordError(err) // TODO: more context

				return
			}

			m.Lock()
			defer m.Unlock()

			if !sizesOnly {
				schema.TableDefinitions = resp.Schema.TableDefinitions
			}

			for _, td := range resp.Schema.TableDefinitions {
				tableSize, ok := schema.TableSizes[td.Name]
				if !ok {
					tableSize = &vtadminpb.Schema_TableSize{
						ByShard: map[string]*vtadminpb.Schema_ShardTableSize{},
					}
					schema.TableSizes[td.Name] = tableSize
				}

				if _, ok = tableSize.ByShard[tablet.Tablet.Shard]; ok {
					// We managed to query for the same shard twice, that's ...
					// weird. but do we care? maybe just log? idk!
					log.Warningf("log message goes here")

					return
				}

				tableSize.RowCount += td.RowCount
				tableSize.DataLength += td.DataLength

				tableSize.ByShard[tablet.Tablet.Shard] = &vtadminpb.Schema_ShardTableSize{
					RowCount:   td.RowCount,
					DataLength: td.DataLength,
				}
			}
		}(tablet, sizesOnly)

		// If we have more than one tablet to query, we definitely don't want to
		// get more than the sizes twice, so invariably set this to true for
		// subsequent iterations
		sizesOnly = true
	}

	wg.Wait()

	if rec.HasErrors() {
		return nil, rec.Error()
	}

	return schema, nil
}

// GetVSchema returns the vschema for a given keyspace in this cluster. The
// caller is responsible for making at least one call to c.Vtctld.Dial prior to
// calling this function.
func (c *Cluster) GetVSchema(ctx context.Context, keyspace string) (*vtadminpb.VSchema, error) {
	span, ctx := trace.NewSpan(ctx, "Cluster.GetVSchema")
	defer span.Finish()

	AnnotateSpan(c, span)
	span.Annotate("keyspace", keyspace)

	vschema, err := c.Vtctld.GetVSchema(ctx, &vtctldatapb.GetVSchemaRequest{
		Keyspace: keyspace,
	})

	if err != nil {
		return nil, err
	}

	return &vtadminpb.VSchema{
		Cluster: c.ToProto(),
		Name:    keyspace,
		VSchema: vschema.VSchema,
	}, nil
}

// GetWorkflowOptions is the set of filtering options for GetWorkflow requests.
type GetWorkflowOptions struct {
	ActiveOnly bool
}

// GetWorkflow returns the single Workflow in this cluster for the given
// keyspace and workflow name. It returns an error if either no workflows or
// multiple workflows are found.
func (c *Cluster) GetWorkflow(ctx context.Context, keyspace string, name string, opts GetWorkflowOptions) (*vtadminpb.Workflow, error) {
	span, ctx := trace.NewSpan(ctx, "Cluster.GetWorkflow")
	defer span.Finish()

	AnnotateSpan(c, span)
	span.Annotate("active_only", opts.ActiveOnly)
	span.Annotate("keyspace", keyspace)
	span.Annotate("workflow_name", name)

	if err := c.Vtctld.Dial(ctx); err != nil {
		return nil, fmt.Errorf("GetWorkflow(cluster = %v, keyspace = %v, workflow = %v, opts = %+v) dial failed: %w", c.ID, keyspace, name, opts, err)
	}

	workflows, err := c.findWorkflows(ctx, []string{keyspace}, FindWorkflowsOptions{
		ActiveOnly: opts.ActiveOnly,
		Filter: func(workflow *vtadminpb.Workflow) bool {
			return workflow.Workflow.Name == name
		},
	})
	if err != nil {
		return nil, err
	}

	switch len(workflows.Workflows) {
	case 0:
		msg := "%w for keyspace %s and name %s (active_only = %v)"
		if len(workflows.Warnings) > 0 {
			return nil, fmt.Errorf(msg+"; warnings: %v", errors.ErrNoWorkflow, keyspace, name, opts.ActiveOnly, workflows.Warnings)
		}

		return nil, fmt.Errorf(msg, errors.ErrNoWorkflow, keyspace, name, opts.ActiveOnly)
	case 1:
		return workflows.Workflows[0], nil
	default:
		return nil, fmt.Errorf("%w: found %d workflows in keyspace %s with name %s (active_only = %v); this should be impossible", errors.ErrAmbiguousWorkflow, len(workflows.Workflows), keyspace, name, opts.ActiveOnly)
	}
}

// GetWorkflowsOptions is the set of filtering options for GetWorkflows
// requests.
type GetWorkflowsOptions struct {
	ActiveOnly      bool
	IgnoreKeyspaces sets.String
}

// GetWorkflows returns a list of Workflows in this cluster, across the given
// keyspaces and filtering according to the options passed in.
//
// If the list of keyspaces to check is empty, then GetWorkflows will use the
// result of GetKeyspaces to search all keyspaces in the cluster. In this case,
// opts.IgnoreKeyspaces is respected.
func (c *Cluster) GetWorkflows(ctx context.Context, keyspaces []string, opts GetWorkflowsOptions) (*vtadminpb.ClusterWorkflows, error) {
	span, ctx := trace.NewSpan(ctx, "Cluster.GetWorkflows")
	defer span.Finish()

	AnnotateSpan(c, span)
	span.Annotate("active_only", opts.ActiveOnly)

	if err := c.Vtctld.Dial(ctx); err != nil {
		return nil, fmt.Errorf("GetWorkflows(cluster = %v, keyspaces = %v, opts = %v) dial failed: %w", c.ID, keyspaces, opts, err)
	}

	return c.findWorkflows(ctx, keyspaces, FindWorkflowsOptions{
		ActiveOnly:      opts.ActiveOnly,
		IgnoreKeyspaces: opts.IgnoreKeyspaces,
		Filter:          func(_ *vtadminpb.Workflow) bool { return true },
	})
}

// FindTablet returns the first tablet in a given cluster that satisfies the filter function.
func (c *Cluster) FindTablet(ctx context.Context, filter func(*vtadminpb.Tablet) bool) (*vtadminpb.Tablet, error) {
	span, ctx := trace.NewSpan(ctx, "Cluster.FindTablet")
	defer span.Finish()

	AnnotateSpan(c, span)

	tablets, err := c.findTablets(ctx, filter, 1)
	if err != nil {
		return nil, err
	}

	if len(tablets) != 1 {
		return nil, errors.ErrNoTablet
	}

	return tablets[0], nil
}

// FindTablets returns the first N tablets in the given cluster that satisfy
// the filter function. If N = -1, then all matching tablets are returned.
// Ordering is not guaranteed, and callers should write their filter functions accordingly.
func (c *Cluster) FindTablets(ctx context.Context, filter func(*vtadminpb.Tablet) bool, n int) ([]*vtadminpb.Tablet, error) {
	span, ctx := trace.NewSpan(ctx, "Cluster.FindTablets")
	defer span.Finish()

	AnnotateSpan(c, span)

	return c.findTablets(ctx, filter, n)
}

func (c *Cluster) findTablets(ctx context.Context, filter func(*vtadminpb.Tablet) bool, n int) ([]*vtadminpb.Tablet, error) {
	span, _ := trace.FromContext(ctx)

	tablets, err := c.GetTablets(ctx)
	if err != nil {
		return nil, err
	}

	if n == -1 {
		n = len(tablets)
	}

	if span != nil {
		span.Annotate("max_result_length", n) // this is a bad name; I didn't want just "n", but it's more like, "requested result length".
	}

	return vtadminproto.FilterTablets(filter, tablets, n), nil
}
