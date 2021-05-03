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
import cx from 'classnames';
import React, { useCallback } from 'react';
import { NavLink, useParams, useRouteMatch } from 'react-router-dom';

import { useWorkflow } from '../../../hooks/api';
import { useSyncedURLParam } from '../../../hooks/useSyncedURLParam';
import { vtctldata } from '../../../proto/vtadmin';
import { formatDateTime } from '../../../util/time';
import { Button } from '../../Button';
import { DataCell } from '../../dataTable/DataCell';
import { DataTable } from '../../dataTable/DataTable';
import { Icons } from '../../Icon';
import { StreamStatePip } from '../../pips/StreamStatePip';
import { TextInput } from '../../TextInput';
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
    const { value: filter, updateValue: updateFilter } = useSyncedURLParam('filter');
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
                const rowClass = cx({ [style.activeRow]: row.id === streamID });
                return (
                    <tr className={rowClass} key={row.id}>
                        <DataCell className={style.streamCell}>
                            <NavLink to={`/workflow/${clusterID}/${keyspace}/${name}/streams/${row.id}`}>
                                <div className={style.streamID}>
                                    <StreamStatePip state={row.stream.state} /> {row.id}
                                </div>
                                <div className={style.detailsHint}>View details</div>
                            </NavLink>
                        </DataCell>
                        <DataCell>
                            {row.stream.state}
                            <div className="text-color-secondary font-size-small">
                                Updated {formatDateTime(row.stream.time_updated?.seconds)}
                            </div>
                        </DataCell>
                        <DataCell>
                            <a href="#">
                                {row.stream.binlog_source?.keyspace}/{row.stream.binlog_source?.shard}
                            </a>
                            <div className="text-color-secondary font-size-small">{data?.cluster?.name}</div>
                        </DataCell>
                        <DataCell>
                            <a href="#">
                                {targetKeyspace}/{row.stream.shard}
                            </a>
                            <div className="text-color-secondary font-size-small">{data?.cluster?.name}</div>
                        </DataCell>
                        <DataCell>
                            <a href="#">
                                {row.stream.tablet?.cell}-{row.stream.tablet?.uid}
                            </a>
                        </DataCell>
                    </tr>
                );
            });
        },
        [clusterID, data?.cluster?.name, keyspace, name, streamID, targetKeyspace]
    );

    return (
        <div className={style.container}>
            <div className={style.streamsContainer}>
                <div className="max-width-content">
                    <div className={style.controls}>
                        <TextInput
                            iconLeft={Icons.search}
                            onChange={(e) => updateFilter(e.target.value)}
                            placeholder="Filter streams"
                            value={filter || ''}
                        />
                        <Button disabled={!filter} onClick={() => updateFilter('')} secondary>
                            Clear filters
                        </Button>
                    </div>
                    <DataTable
                        columns={['Stream', 'Source', 'Target', 'Tablet', 'State']}
                        data={streams}
                        renderRows={renderRows}
                    />
                </div>
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
