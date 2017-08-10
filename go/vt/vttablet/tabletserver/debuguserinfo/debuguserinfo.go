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

// Package callerid stores/retrives CallerIDs (immediate CallerID
// and effective CallerID) to/from the Context
package debuguserinfo

import (
	"github.com/youtube/vitess/go/vt/callerid"
	"golang.org/x/net/context"
)

const (
	appDebubUsernameKey string = "appdebug_username"
)

// Get value for useAppDebug
func GetUseAppDebug(ctx context.Context) bool {
	useAppDebug, ok := ctx.Value(appDebubUsernameKey).(bool)
	if ok {
		return useAppDebug
	}
	return false
}

func IsCallerIDAppDebug(ctx context.Context, appDebugUsername string) bool {
	callerID := callerid.ImmediateCallerIDFromContext(ctx)
	return callerID != nil && callerID.Username == appDebugUsername
}

// Set if it should use AppDebug in the context
func SetUseAppDebug(ctx context.Context, appDebugUsername string) context.Context {
	useAppDebug := IsCallerIDAppDebug(ctx, appDebugUsername)
	newCtx := context.WithValue(ctx, appDebubUsernameKey, useAppDebug)
	return newCtx
}
