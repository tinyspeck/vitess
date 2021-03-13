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
import { groupBy, orderBy } from 'lodash';
import * as React from 'react';
import { Link } from 'react-router-dom';

import { useWorkflows } from '../../hooks/api';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { vtadmin as pb, vtctldata } from '../../proto/vtadmin';
import { DataTable } from '../dataTable/DataTable';
import style from './Workflows.module.scss';

export const Workflows = () => {
    useDocumentTitle('Workflows');

    const { data } = useWorkflows();
    const rows = React.useMemo(() => formatRows(data), [data]);

    const renderRows = (rs: typeof rows) => {
        return rows.map((row) => {
            const href =
                row.clusterID && row.keyspace && row.name
                    ? `/workflow/${row.clusterID}/${row.keyspace}/${row.name}`
                    : null;

            return (
                <tr key={`${row.cluster}-${row.keyspace}-${row.name}`}>
                    <td>
                        <code className="font-weight-bold">{href ? <Link to={href}>{row.name}</Link> : row.name}</code>
                    </td>
                    <td>
                        <code>{row.cluster}</code>
                    </td>
                    <td>
                        {row.sources.length
                            ? row.sources.map((s) => (
                                  <div key={s}>
                                      <code>{s}</code>
                                  </div>
                              ))
                            : '-'}
                    </td>
                    <td>
                        {row.targets.length
                            ? row.targets.map((s) => (
                                  <div key={s}>
                                      <code>{s}</code>
                                  </div>
                              ))
                            : '-'}
                    </td>
                    <td>{typeof row.maxLag === 'number' ? `${Number(row.maxLag).toLocaleString()} s` : '-'}</td>
                    <td>
                        {Object.entries(row.streams).map(([state, streams]) => (
                            <div key={state}>
                                <code>
                                    {streams.length} {state.toLocaleLowerCase()}
                                </code>
                            </div>
                        ))}
                    </td>
                </tr>
            );
        });
    };

    return (
        <div>
            <h1>Workflows</h1>
            <div className={style.container}>
                <DataTable
                    columns={['Name', 'Cluster', 'Source', 'Target', 'Max Lag', 'Streams']}
                    data={rows}
                    renderRows={renderRows}
                />
            </div>
        </div>
    );
};

const formatRows = (data: pb.GetWorkflowsResponse | null | undefined) => {
    return orderBy(
        Object.values(data?.workflows_by_cluster || {}).reduce((acc, cws) => {
            (cws.workflows || []).forEach((w) => {
                acc.push(formatRow(w));
            });

            return acc;
        }, [] as ReturnType<typeof formatRow>[]),
        ['name', 'cluster']
    );
};

const formatRow = (w: pb.IWorkflow) => ({
    cluster: w.cluster?.name,
    clusterID: w.cluster?.id,
    keyspace: w.keyspace,
    maxLag: w.workflow?.max_v_replication_lag,
    name: w.workflow?.name,
    sources: w.workflow?.source?.keyspace
        ? (w.workflow?.source?.shards || []).map((s) => `${w.workflow?.source?.keyspace}/${s}`).sort()
        : [],
    targets: w.workflow?.target?.keyspace
        ? (w.workflow?.target?.shards || []).map((s) => `${w.workflow?.target?.keyspace}/${s}`).sort()
        : [],
    streams: groupBy(
        Object.values(w.workflow?.shard_streams || {}).reduce((acc, ss) => {
            (ss.streams || []).forEach((s) => {
                acc.push(s);
            });
            return acc;
        }, [] as vtctldata.Workflow.IStream[]),
        'state'
    ),
});
