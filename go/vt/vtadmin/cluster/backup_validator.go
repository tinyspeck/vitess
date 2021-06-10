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
	"context"

	vtadminpb "vitess.io/vitess/go/vt/proto/vtadmin"
)

// BackupValidator defines the interface that custom backup logic must adhere
// to. Users may provide their own implementations to inject their
// deployment-specific logic.
type BackupValidator interface {
	// ValidateBackups performs custom logic to validate a set of backups. If a
	// cluster is configured with a BackupValidator implementation, this
	// function will be called during the GetBackups rpc. Any errors returned
	// from this function will be logged but will not fail the overall request.
	//
	// While the primary purpose of this function is to populate the Status
	// field, implementations may set any fields on the backup proto messages
	// they like. They receive a copy of the Cluster to which the backups
	// belong, so they may use any of the public methods as part of validation,
	// but cannot modify the calling cluster.
	ValidateBackups(ctx context.Context, c Cluster, backups ...*vtadminpb.Backup) error
}
