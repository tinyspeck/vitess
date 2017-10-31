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

package servenv

import (
	"golang.org/x/net/context"

	log "github.com/golang/glog"
)

type VitessAuthPlugin interface {
	Authenticate(ctx context.Context, fullMethod string) (context.Context, error)
}

// authPlugins is a registry of VitessAuthPlugin implementations.
var authPlugins = make(map[string]VitessAuthPlugin)

// RegisterAuthPluginImpl registers an implementations of AuthServer.
func RegisterAuthPluginImpl(name string, authPlugin VitessAuthPlugin) {
	if _, ok := authPlugins[name]; ok {
		log.Fatalf("AuthPlugin named %v already exists", name)
	}
	authPlugins[name] = authPlugin
}

// GetAuthPlugin returns an AuthPlugin by name, or log.Fatalf.
func GetAuthPlugin(name string) VitessAuthPlugin {
	authPlugin, ok := authPlugins[name]
	if !ok {
		log.Fatalf("no AuthPlugin name %v registered", name)
	}
	return authPlugin
}
