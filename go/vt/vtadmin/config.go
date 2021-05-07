/*
Copyright 2021 The Vitess Authors.

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

package vtadmin

import (
	"fmt"
	"plugin"

	vtadminpb "vitess.io/vitess/go/vt/proto/vtadmin"
)

// Config contains the global options for the API.
type Config struct {
	TabletMetadataPlugin tabletMetadataPluginFlag
}

type tabletMetadataPluginFlag struct {
	plugin func(tablet *vtadminpb.Tablet) (map[string]string, error)
	path   string
}

// Get returns the set metadata plugin func, if set.
func (f *tabletMetadataPluginFlag) Get() func(*vtadminpb.Tablet) (map[string]string, error) {
	return f.plugin
}

// String is part of the pflag.Value interface.
func (f *tabletMetadataPluginFlag) String() string {
	var loaded bool
	if f.plugin != nil {
		loaded = true
	}

	return fmt.Sprintf("path=%s loaded=%v", f.path, loaded)
}

const tabletMetadataFuncSymbol = "TabletMetadataFunc"

// Set is part of the pflag.Value interface.
func (f *tabletMetadataPluginFlag) Set(arg string) error {
	if f.plugin != nil {
		return fmt.Errorf("%s already set %s", f.Type(), f.String())
	}

	p, err := plugin.Open(arg)
	if err != nil {
		return fmt.Errorf("error loading plugin at %s: %w", arg, err)
	}

	sym, err := p.Lookup(tabletMetadataFuncSymbol)
	if err != nil {
		return fmt.Errorf("no symbol named %s in %s: %w", tabletMetadataFuncSymbol, arg, err)
	}

	var ok bool
	f.plugin, ok = sym.(func(*vtadminpb.Tablet) (map[string]string, error))
	if !ok {
		return fmt.Errorf("symbol %s in %s is not of type %T", tabletMetadataFuncSymbol, arg, f.plugin)
	}

	f.path = arg
	return nil
}

// Type is part of the pflag.Value interface.
func (f *tabletMetadataPluginFlag) Type() string {
	return "TabletMetadataPlugin"
}
