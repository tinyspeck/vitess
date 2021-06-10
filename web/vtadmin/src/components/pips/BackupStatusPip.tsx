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

import { Pip, PipState } from './Pip';
import { vtadmin as pb } from '../../proto/vtadmin';

interface Props {
    status: pb.Backup.Status | null | undefined;
}

const STATUS_STATES: { [s in pb.Backup.Status]: PipState } = {
    [pb.Backup.Status.UNKNOWN]: 'danger',
    [pb.Backup.Status.INCOMPLETE]: 'danger',
    [pb.Backup.Status.COMPLETE]: 'danger',
    [pb.Backup.Status.INVALID]: 'danger',
    [pb.Backup.Status.VALID]: 'danger',
};

export const BackupStatusPip = ({ status }: Props) => {
    const state = status ? STATUS_STATES[status] : null;
    return <Pip state={state} />;
};
