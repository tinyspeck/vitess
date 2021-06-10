/**
 * Copyright 2021 The Vitess Authors.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { vtadmin as pb } from '../proto/vtadmin';

export interface Backup {
    clusterID: string;
    backup: pb.Backup;
}

/**
 * getBackups returns a flat list of all backups in a GetBackupsResponse.
 */
export const getBackups = (r: pb.GetBackupsResponse | null | undefined): Backup[] => {
    if (!r) {
        return [];
    }

    return Object.entries(r.backups).reduce((acc, [clusterID, backups]) => {
        (backups.backups || []).forEach((backup) => {
            acc.push({
                clusterID,
                backup: pb.Backup.create(backup),
            });
        });
        return acc;
    }, [] as Backup[]);
};
