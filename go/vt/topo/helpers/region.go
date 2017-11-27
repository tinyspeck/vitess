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

package helpers

import (
	"github.com/youtube/vitess/go/vt/topo"
)

// BuildCellToRegion function is a wrapper around topo.Server#GetRegionByCell with caching and error handling
func BuildCellToRegion(topoServer topo.Server) func(cell string) string {

	cellsToRegions := make(map[string]string)

	return func(cell string) string {
		if region, ok := cellsToRegions[cell]; ok {
			return region
		}
		if region, err := topoServer.GetRegionByCell(cell); err == nil {
			cellsToRegions[cell] = region
			return region
		}
		return ""
	}
}
