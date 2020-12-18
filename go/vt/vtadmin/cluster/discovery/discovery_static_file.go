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

package discovery

import (
	"context"
	"encoding/json"
	"errors"
	"io/ioutil"
	"math/rand"

	"github.com/spf13/pflag"
	vtadminpb "vitess.io/vitess/go/vt/proto/vtadmin"
)

// StaticFileDiscovery implements the Discovery interface for "discovering"
// Vitess components hardcoded in a static .json file.
type StaticFileDiscovery struct {
	cluster string
	config  *StaticFileClusterConfig
	gates   struct {
		byName map[string]*vtadminpb.VTGate
		byTag  map[string][]*vtadminpb.VTGate
	}
}

// StaticFileClusterConfig configures Vitess components for a single cluster.
type StaticFileClusterConfig struct {
	VTGates []*StaticFileVTGateConfig `json:"vtgates,omitempty"`
}

// StaticFileVTGateConfig contains host and tag information for a single VTGate in a cluster.
type StaticFileVTGateConfig struct {
	Host *vtadminpb.VTGate `json:"host"`
	Tags []string          `json:"tags"`
}

// NewStaticFile returns a StaticFileDiscovery for the given cluster.
func NewStaticFile(cluster string, flags *pflag.FlagSet, args []string) (Discovery, error) {
	disco := &StaticFileDiscovery{
		cluster: cluster,
	}

	filePath := flags.String("path", "", "path to the service discovery JSON config file")
	if err := flags.Parse(args); err != nil {
		return nil, err
	}

	if filePath == nil || *filePath == "" {
		return nil, errors.New("must specify path to the service discovery JSON config file")
	}

	b, err := ioutil.ReadFile(*filePath)
	if err != nil {
		return nil, err
	}

	if err := disco.parseConfig(b); err != nil {
		return nil, err
	}

	return disco, nil
}

func (d *StaticFileDiscovery) parseConfig(bytes []byte) error {
	if err := json.Unmarshal(bytes, &d.config); err != nil {
		return err
	}

	d.gates.byName = make(map[string]*vtadminpb.VTGate, len(d.config.VTGates))
	d.gates.byTag = make(map[string][]*vtadminpb.VTGate)

	// Index the gates by name and by tag for easier lookups
	for _, gate := range d.config.VTGates {
		d.gates.byName[gate.Host.Hostname] = gate.Host

		for _, tag := range gate.Tags {
			d.gates.byTag[tag] = append(d.gates.byTag[tag], gate.Host)
		}
	}
	return nil
}

// DiscoverVTGate is part of the Discovery interface.
func (d *StaticFileDiscovery) DiscoverVTGate(ctx context.Context, tags []string) (*vtadminpb.VTGate, error) {
	gates, err := d.DiscoverVTGates(ctx, tags)
	if err != nil {
		return nil, err
	}

	count := len(gates)
	if count == 0 {
		return nil, ErrNoVTGates
	}

	gate := gates[rand.Intn(len(gates))]
	return gate, nil
}

// DiscoverVTGateAddr is part of the Discovery interface.
func (d *StaticFileDiscovery) DiscoverVTGateAddr(ctx context.Context, tags []string) (string, error) {
	gate, err := d.DiscoverVTGate(ctx, tags)
	if err != nil {
		return "", err
	}

	return gate.Hostname, nil
}

// DiscoverVTGates is part of the Discovery interface.
func (d *StaticFileDiscovery) DiscoverVTGates(ctx context.Context, tags []string) ([]*vtadminpb.VTGate, error) {
	if len(tags) == 0 {
		results := []*vtadminpb.VTGate{}
		for _, g := range d.gates.byName {
			results = append(results, g)
		}

		return results, nil
	}

	set := d.gates.byName

	for _, tag := range tags {
		intermediate := map[string]*vtadminpb.VTGate{}

		gates, ok := d.gates.byTag[tag]
		if !ok {
			return []*vtadminpb.VTGate{}, nil
		}

		for _, g := range gates {
			if _, ok := set[g.Hostname]; ok {
				intermediate[g.Hostname] = g
			}
		}

		set = intermediate
	}

	results := make([]*vtadminpb.VTGate, 0, len(set))

	for _, gate := range set {
		results = append(results, gate)
	}

	return results, nil
}
