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
import { vtctldata, vtadmin as pb } from '../proto/vtadmin';

/**
 * getStreams returns a flat list of streams across all keyspaces/shards in the workflow.
 */
export const getStreams = <W extends pb.IWorkflow>(workflow: W | null | undefined): vtctldata.Workflow.IStream[] => {
    if (!workflow) {
        return [];
    }

    return Object.values(workflow.workflow?.shard_streams || {}).reduce((acc, shardStream) => {
        (shardStream.streams || []).forEach((stream) => {
            acc.push(stream);
        });
        return acc;
    }, [] as vtctldata.Workflow.IStream[]);
};

export const findStream = <W extends pb.IWorkflow>(workflow: W | null | undefined, streamID: string) => {
    if (!workflow || !streamID) {
        return null;
    }

    const re = /(\S+)\-(\d+)$/.exec(streamID);

    if (!Array.isArray(re) || re.length < 3) {
        return null;
    }

    const shardKey = re[1];
    const sid = parseInt(re[2]);

    const shard =
        shardKey && shardKey in (workflow?.workflow?.shard_streams || {})
            ? (workflow?.workflow?.shard_streams || {})[shardKey]
            : null;

    if (!shard) {
        return null;
    }

    const stream = (shard.streams || []).find((s) => s.id === sid);
    if (!stream) {
        return null;
    }

    return stream;
};

/**
 * getTimeUpdated returns the `time_updated` timestamp of the most recently
 * updated stream in the workflow.
 */
export const getTimeUpdated = <W extends pb.IWorkflow>(workflow: W | null | undefined): number => {
    // Note: long-term it may be better to get this from the `vreplication_log` data
    // added by https://github.com/vitessio/vitess/pull/7831
    const timestamps = getStreams(workflow).map((s) => parseInt(`${s.time_updated?.seconds}`, 10));
    return Math.max(...timestamps);
};
