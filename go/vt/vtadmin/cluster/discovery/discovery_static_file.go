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
	"io/ioutil"
	"math/rand"

	"github.com/spf13/pflag"
	vtadminpb "vitess.io/vitess/go/vt/proto/vtadmin"
)

// StaticFileDiscovery implements the Discovery interface for reading service discovery
// configuration from a static config file.
type StaticFileDiscovery struct {
	cluster string
	config  *StaticFileClusterConfig
	gates   struct {
		byName map[string]*vtadminpb.VTGate
		byTag  map[string][]*vtadminpb.VTGate
	}
}

// StaticFileClusterConfig configures a single cluster
type StaticFileClusterConfig struct {
	VTGates []*StaticFileVTGateConfig `json:"vtgates,omitempty"`
}

type StaticFileVTGateConfig struct {
	Host *vtadminpb.VTGate `json:"host"`
	Tags []string          `json:"tags"`
}

// NewStaticFile returns a StaticFileDiscovery for the given cluster.
func NewStaticFile(cluster string, flags *pflag.FlagSet, args []string) (Discovery, error) {
	disco := &StaticFileDiscovery{
		cluster: cluster,
	}

	filePath := flags.String("path", "", "path to the static JSON file")
	if err := flags.Parse(args); err != nil {
		return nil, err
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
	gates := []*vtadminpb.VTGate{}

	if len(tags) == 0 {
		for _, g := range d.gates.byName {
			gates = append(gates, g)
		}
	} else {
		for _, t := range tags {
			gs := d.gates.byTag[t]
			gates = append(gates, gs...)
		}
	}

	return gates, nil
}
