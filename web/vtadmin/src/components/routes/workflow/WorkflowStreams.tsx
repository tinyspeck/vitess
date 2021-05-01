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
import { useCallback } from 'react';
import { NavLink, useParams, useRouteMatch } from 'react-router-dom';

import { useWorkflow } from '../../../hooks/api';
import { vtctldata } from '../../../proto/vtadmin';
import { DataCell } from '../../dataTable/DataCell';
import { DataTable } from '../../dataTable/DataTable';
import { StreamStatePip } from '../../pips/StreamStatePip';
import { WorkflowStreamDetails } from './WorkflowStreamDetails';
import style from './WorkflowStreams.module.scss';

interface Props {
    clusterID: string;
    keyspace: string;
    name: string;
}

interface RouteParams {
    streamID?: string;
}

interface StreamRow {
    id: string;
    stream: vtctldata.Workflow.IStream;
}

export const WorkflowStreams = ({ clusterID, keyspace, name }: Props) => {
    const { data } = useWorkflow({ clusterID, keyspace, name });
    const { streamID } = useParams<RouteParams>();

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

    const renderRows = useCallback(
        (rows: typeof streams) => {
            return rows.map((row) => {
                return (
                    <tr key={row.id}>
                        <DataCell>
                            <NavLink
                                className="font-weight-bold"
                                to={`/workflow/${clusterID}/${keyspace}/${name}/streams/${row.id}`}
                            >
                                <StreamStatePip state={row.stream.state} /> {row.id}
                            </NavLink>
                        </DataCell>
                        <DataCell>{row.stream.state}</DataCell>
                        <DataCell>
                            {row.stream.binlog_source?.keyspace}/{row.stream.binlog_source?.shard}
                        </DataCell>
                        <DataCell>
                            {targetKeyspace}/{row.stream.shard}
                        </DataCell>
                        <DataCell>
                            {row.stream.tablet?.cell}-${row.stream.tablet?.uid}
                        </DataCell>
                    </tr>
                );
            });
        },
        [clusterID, keyspace, name, targetKeyspace]
    );

    return (
        <div className={style.container}>
            <div className={style.streamsContainer}>
                <DataTable
                    columns={['Stream', 'State', 'Source', 'Target', 'Tablet']}
                    data={streams}
                    renderRows={renderRows}
                />
            </div>

            {streamID && (
                <div className={style.streamDetailsContainer}>
                    <WorkflowStreamDetails
                        clusterID={clusterID}
                        keyspace={keyspace}
                        streamID={streamID}
                        workflowName={name}
                    />
                </div>
            )}
        </div>
    );
};
