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
import { orderBy } from 'lodash-es';
import * as React from 'react';

import { useWorkflow } from '../../../hooks/api';
import { vtadmin as pb, vtctldata } from '../../../proto/vtadmin';
import { DataTable } from '../../dataTable/DataTable';
import style from './Streams.module.scss';

interface Props {
    clusterID: string;
    keyspace: string;
    name: string;
}

export const Streams = ({ clusterID, keyspace, name }: Props) => {
    const { data } = useWorkflow({ clusterID, keyspace, name });
    const shardStreams = orderBy(
        Object.values(data?.workflow?.shard_streams || {}).reduce((acc, ss) => {
            (ss.streams || []).forEach((s) => acc.push(s));
            return acc;
        }, [] as vtctldata.Workflow.IStream[]),
        ['state', 'shard', 'tablet.cell', 'tablet.uid']
    );
    const renderRows = (rows: typeof shardStreams) => {
        return rows.map((row, rdx) => {
            return (
                <tr key={rdx}>
                    <td>{row.state}</td>
                    <td>
                        <code>
                            {keyspace}/{row.shard}
                        </code>
                    </td>
                    <td>
                        {row.tablet?.cell && row.tablet?.uid ? (
                            <code>{`${row.tablet.cell}-${row.tablet.uid}`}</code>
                        ) : (
                            '-'
                        )}
                    </td>
                    <td>
                        <ol className={style.filterList}>
                            {(row.binlog_source?.filter?.rules || []).map((rule, idx) => (
                                <li key={idx}>
                                    Filter: <code>{rule.filter}</code>, match: <code>{rule.match}</code>
                                </li>
                            ))}
                        </ol>
                    </td>
                    <td>{row.time_updated?.seconds}</td>
                    <td>{row.transaction_timestamp?.seconds}</td>
                    <td>
                        {typeof row.time_updated?.seconds === 'number' &&
                        typeof row.transaction_timestamp?.seconds === 'number'
                            ? `${row.time_updated.seconds - row.transaction_timestamp.seconds} s`
                            : '-'}
                    </td>
                    <td style={{ maxWidth: 240 }}>
                        <code>{row.position}</code>
                    </td>
                    <td style={{ maxWidth: 360 }}>
                        <code>{row.message}</code>
                    </td>
                </tr>
            );
        });
    };

    return (
        <DataTable
            columns={[
                'State',
                'Shard',
                'Tablet',
                'Filter',
                'Time Updated',
                'Txn Timestamp',
                'Lag',
                'Position',
                'Message',
            ]}
            data={shardStreams}
            renderRows={renderRows}
        />
    );
};
