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

package auth

import (
	"context"
	"fmt"
	"net/http"
	"plugin"

	"google.golang.org/grpc"
)

type Info interface {
	GetPrincipal() string
	GetRoles() []string
	HasRole(role string) bool
}

type Unauthenticated struct{}

func (u *Unauthenticated) GetPrincipal() string     { return "" }
func (u *Unauthenticated) GetRoles() []string       { return nil }
func (u *Unauthenticated) HasRole(role string) bool { return false }

type Authenticator interface {
	AuthenticateUnary(ctx context.Context, req interface{}, info *grpc.UnaryServerInfo) (Info error)
}

type HTTPAuthenticator interface {
	AuthenticateHTTP(r *http.Request) (Info, error)
}

type authkey struct{}

func NewContext(ctx context.Context, info Info) context.Context {
	return context.WithValue(ctx, authkey{}, info)
}

func FromContext(ctx context.Context) (Info, bool) {
	info, ok := ctx.Value(authkey{}).(Info)
	return info, ok
}

func LoadPlugin(path string) (Authenticator, error) {
	p, err := plugin.Open(path)
	if err != nil {
		return nil, err
	}

	sym, err := p.Lookup("Authenticator")
	if err != nil {
		return nil, err
	}

	authenticator, ok := sym.(Authenticator)
	if !ok {
		return nil, fmt.Errorf("plugin %s does not contain symbol named \"Authenticator\" implementing auth.Authenticator", path)
	}

	return authenticator, nil
}
