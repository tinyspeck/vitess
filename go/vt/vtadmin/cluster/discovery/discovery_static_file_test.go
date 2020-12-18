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
	"testing"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
	"vitess.io/vitess/go/vt/proto/vtadmin"
	vtadminpb "vitess.io/vitess/go/vt/proto/vtadmin"
)

func TestDiscoverVTGate(t *testing.T) {
	tests := []struct {
		name      string
		contents  []byte
		expected  *vtadminpb.VTGate
		tags      []string
		shouldErr bool
	}{
		{
			name:      "empty config",
			contents:  []byte(`{}`),
			expected:  nil,
			shouldErr: false,
		},
		{
			name: "one gate",
			contents: []byte(`
				{
					"vtgates": [{
						"host": {
							"hostname": "127.0.0.1:12345"
						}
					}]
				}
			`),
			expected: &vtadmin.VTGate{
				Hostname: "127.0.0.1:12345",
			},
		},
		{
			name: "filtered by tags (one match)",
			contents: []byte(`
				{
					"vtgates": [
						{
							"host": {
								"hostname": "127.0.0.1:11111"
							},
							"tags": ["cell:cellA"]
						}, 
						{
							"host": {
								"hostname": "127.0.0.1:22222"
							},
							"tags": ["cell:cellB"]
						},
						{
							"host": {
								"hostname": "127.0.0.1:33333"
							},
							"tags": ["cell:cellA"]
						}
					]
				}
			`),
			expected: &vtadminpb.VTGate{
				Hostname: "127.0.0.1:22222",
			},
			tags: []string{"cell:cellB"},
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			disco := &StaticFileDiscovery{}
			err := disco.parseConfig(tt.contents)
			require.NoError(t, err)

			gate, err := disco.DiscoverVTGate(context.Background(), tt.tags)
			if tt.shouldErr {
				assert.Error(t, err, assert.AnError)
				return
			}

			assert.NoError(t, err)
			assert.Equal(t, tt.expected, gate)
		})
	}
}

func TestDiscoverVTGates(t *testing.T) {
	tests := []struct {
		name      string
		contents  []byte
		tags      []string
		expected  []*vtadminpb.VTGate
		shouldErr bool
	}{
		{
			name:      "empty config",
			contents:  []byte(`{}`),
			expected:  []*vtadminpb.VTGate{},
			shouldErr: false,
		},
		{
			name: "no tags",
			contents: []byte(`
				{
					"vtgates": [
						{
							"host": {
								"hostname": "127.0.0.1:12345"
							}
						},
						{
							"host": {
								"hostname": "127.0.0.1:67890"
							}
						}
					]
				}
			`),
			expected: []*vtadminpb.VTGate{
				{Hostname: "127.0.0.1:12345"},
				{Hostname: "127.0.0.1:67890"},
			},
			shouldErr: false,
		},
		{
			name: "filtered by tags",
			contents: []byte(`
				{
					"vtgates": [
						{
							"host": {
								"hostname": "127.0.0.1:11111"
							},
							"tags": ["cell:cellA"]
						}, 
						{
							"host": {
								"hostname": "127.0.0.1:22222"
							},
							"tags": ["cell:cellB"]
						},
						{
							"host": {
								"hostname": "127.0.0.1:33333"
							},
							"tags": ["cell:cellA"]
						}
					]
				}
			`),
			tags: []string{"cell:cellA"},
			expected: []*vtadminpb.VTGate{
				{Hostname: "127.0.0.1:11111"},
				{Hostname: "127.0.0.1:33333"},
			},
			shouldErr: false,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			disco := &StaticFileDiscovery{}
			err := disco.parseConfig(tt.contents)
			require.NoError(t, err)
			gates, err := disco.DiscoverVTGates(context.Background(), tt.tags)
			if tt.shouldErr {
				assert.Error(t, err, assert.AnError)
				return
			}

			assert.NoError(t, err)
			assert.Equal(t, tt.expected, gates)
		})
	}
}
