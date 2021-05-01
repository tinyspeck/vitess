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
import React, { useCallback } from 'react';
import { useParams } from 'react-router-dom';

import { useWorkflow } from '../../../hooks/api';
import { vtctldata } from '../../../proto/vtadmin';
import { getStreams } from '../../../util/workflows';
import { DataCell } from '../../dataTable/DataCell';
import { DataTable } from '../../dataTable/DataTable';
import { StreamStatePip } from '../../pips/StreamStatePip';
import style from './WorkflowStreams.module.scss';

interface Props {
    clusterID: string;
    keyspace: string;
    name: string;
}

interface StreamRow {
    id: string;
    stream: vtctldata.Workflow.IStream;
}

export const WorkflowStreams = ({ clusterID, keyspace, name }: Props) => {
    const { data } = useWorkflow({ clusterID, keyspace, name });
    console.log(data);

    const targetKeyspace = data?.workflow?.target?.keyspace;
    const streams = Object.entries(data?.workflow?.shard_streams || {}).reduce((acc, [shardKey, shardStream]) => {
        (shardStream.streams || []).forEach((stream) => {
            acc.push({
                id: `${shardKey}-${stream.id}`,
                stream,
            });
        });
        return acc;
    }, [] as StreamRow[]);

    const renderRows = useCallback((rows: typeof streams) => {
        return rows.map((row) => {
            return (
                <tr>
                    <DataCell>
                        <StreamStatePip state={row.stream.state} /> {row.id}
                    </DataCell>
                    <DataCell>{row.stream.state}</DataCell>
                    <DataCell>
                        {row.stream.binlog_source?.keyspace}/{row.stream.binlog_source?.shard}
                    </DataCell>
                    <DataCell>
                        {targetKeyspace}/{row.stream.shard}
                    </DataCell>
                </tr>
            );
        });
    }, []);

    return (
        <div className={style.container}>
            <DataTable columns={['Stream', 'State', 'Source', 'Target']} data={streams} renderRows={renderRows} />
            {/* <table>
                <tbody>
                    {streams.map((stream, sdx) => {
                        return (
                            <tr key={sdx}>
                                <td>
                                    <StreamStatePip state={stream.state} /> {stream.state}
                                </td>
                                <td>{stream.id}</td>
                                <td>{stream.shard}</td>
                            </tr>
                        );
                    })}
                </tbody>
            </table> */}
        </div>
    );
};
