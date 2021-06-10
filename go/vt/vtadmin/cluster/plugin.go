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

package cluster

import (
	"errors"
	"plugin"
)

// ErrBadPlugin is returned from functions that attempt to load or work with
// plugin files.
var ErrBadPlugin = errors.New("error loading plugin")

func loadPlugin(path string, symbol string) (plugin.Symbol, error) {
	p, err := plugin.Open(path)
	if err != nil {
		return nil, err
	}

	return p.Lookup(symbol)
}
