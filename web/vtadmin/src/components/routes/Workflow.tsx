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
import * as React from 'react';
import { useParams } from 'react-router';
import { Link } from 'react-router-dom';

import { useWorkflow } from '../../hooks/api';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { Code } from '../Code';
import { vtadmin as pb, vtctldata } from '../../proto/vtadmin';
import style from './Workflow.module.scss';
import { DataTable } from '../dataTable/DataTable';
import { orderBy } from 'lodash';

interface RouteParams {
    clusterID: string;
    keyspace: string;
    name: string;
}

export const Workflow = () => {
    const { clusterID, keyspace, name } = useParams<RouteParams>();
    useDocumentTitle(name);

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
        <div>
            <header className={style.header}>
                <p>
                    <Link to="/workflows">← All workflows</Link>
                </p>
                <code>
                    <h1>{name}</h1>
                </code>
                <div className={style.headingMeta}>
                    <span>
                        Cluster: <code>{clusterID}</code>
                    </span>
                    <span>
                        Keyspace: <code>{keyspace}</code>
                    </span>
                </div>
            </header>

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

            <div className={style.container}>
                <Code code={JSON.stringify(data, null, 2)} />
            </div>
        </div>
    );
};
