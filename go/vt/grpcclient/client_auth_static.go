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

package grpcclient

import (
	"golang.org/x/net/context"
	"google.golang.org/grpc/credentials"
)

var (
	// StaticAuthClientCreds implements client interface to be able to WithPerRPCCredentials
	_ credentials.PerRPCCredentials = (*StaticAuthClientCreds)(nil)
)

// StaticAuthClientCreds holder for client credentials
type StaticAuthClientCreds struct {
	Username string
	Password string
}

// GetRequestMetadata  gets the request metadata as a map from StaticAuthClientCreds
func (c *StaticAuthClientCreds) GetRequestMetadata(context.Context, ...string) (map[string]string, error) {
	return map[string]string{
		"username": c.Username,
		"password": c.Password,
	}, nil
}

// RequireTransportSecurity indicates whether the credentials requires transport security.
// Given that people can use this with or without TLS, at the moment we are not enforcing
// transport security
func (c *StaticAuthClientCreds) RequireTransportSecurity() bool {
	return false
}
