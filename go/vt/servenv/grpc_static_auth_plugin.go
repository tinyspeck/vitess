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
	"encoding/json"
	"flag"
	"io/ioutil"

	"golang.org/x/net/context"
	"google.golang.org/grpc"
	"google.golang.org/grpc/codes"
	"google.golang.org/grpc/metadata"

	log "github.com/golang/glog"
)

var (
	credsFile                = flag.String("grpc_static_auth_plugin_file", "", "JSON File to read the users/passwords from.")
	requireTransportSecurity = flag.Bool("grpc_static_auth_require_transport_security", false, "when true it requires transport security. Should be use in conjuction with tls certificates")
)

type StaticAuthEntry struct {
	Username string
	Password string
	// TODO (@rafael) Add authorization parameters
}

func (e *StaticAuthEntry) GetRequestMetadata(context.Context, ...string) (map[string]string, error) {
	return map[string]string{
		"username": e.Username,
		"password": e.Password,
	}, nil
}

func (c *StaticAuthEntry) RequireTransportSecurity() bool {
	return *requireTransportSecurity
}

type VitessStaticAuth struct {
	entries []StaticAuthEntry
}

func (sa *VitessStaticAuth) Authenticate(ctx context.Context, fullMethod string) (context.Context, error) {
	if md, ok := metadata.FromIncomingContext(ctx); ok {
		if len(md["username"]) == 0 || len(md["password"]) == 0 {
			return nil, grpc.Errorf(codes.Unauthenticated, "username and password must be provided")
		}
		username := md["username"][0]
		password := md["password"][0]
		for _, authEntry := range sa.entries {
			if username == authEntry.Username && password == authEntry.Password {
				return ctx, nil
			}
		}
		return nil, grpc.Errorf(codes.PermissionDenied, "auth failure: caller %q provided invalid credentials", username)
	}
	return nil, grpc.Errorf(codes.Unauthenticated, "username and password must be provided")
}

func InitVitessStaticAuthPlugin() {
	entries := make([]StaticAuthEntry, 0)
	if *credsFile == "" {
		// NOOP Vitess static auth plugin was not provided
		return
	}

	data, err := ioutil.ReadFile(*credsFile)
	if err != nil {
		log.Fatalf("failed to load auth plugin %v", err)
		return
	}

	err = json.Unmarshal(data, &entries)
	if err != nil {
		log.Fatalf("fail to load static auth plugin: %v", err)
		return
	}
	staticAuthPlugin := &VitessStaticAuth{
		entries: entries,
	}
	log.Info("Vitess status auth plugin have initialized successfully with config from grpc_static_auth_plugin_file")
	RegisterAuthPluginImpl("grpc_static_auth", staticAuthPlugin)
}

func init() {
	RegisterAuthPluginInitializer(InitVitessStaticAuthPlugin)
}
