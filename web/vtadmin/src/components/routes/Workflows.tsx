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
import { filterNouns } from '../../util/filterNouns';
import { Button } from '../Button';
import { DataTable } from '../dataTable/DataTable';
import { Icons } from '../Icon';
import { TextInput } from '../TextInput';
import style from './Workflows.module.scss';

export const Workflows = () => {
    const { data } = useWorkflows();
    const [filter, setFilter] = React.useState<string>('');

    useDocumentTitle('Workflows');

    const rows = React.useMemo(() => formatRows(data, filter), [data, filter]);

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
                        <div className="text-color-secondary font-size-small">
                            <code>{row.cluster}</code>
                        </div>
                    </td>
                    <td>
                        {row._workflow.workflow?.source?.keyspace ? (
                            <>
                                <code>{row._workflow.workflow?.source?.keyspace || '-'}</code>
                            </>
                        ) : (
                            '-'
                        )}
                    </td>
                    <td>
                        <code>{row._workflow.workflow?.target?.keyspace}</code>
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
                <div className={style.controls}>
                    <TextInput
                        autoFocus
                        iconLeft={Icons.search}
                        onChange={(e) => setFilter(e.target.value)}
                        placeholder="Filter workflows"
                        value={filter}
                    />
                    <Button disabled={!filter} onClick={() => setFilter('')} secondary>
                        Clear filters
                    </Button>
                </div>
                <DataTable
                    columns={['Name', 'Source', 'Target', 'Max Lag', 'Streams']}
                    data={rows}
                    renderRows={renderRows}
                />
            </div>
        </div>
    );
};

const formatRows = (data: pb.GetWorkflowsResponse | null | undefined, filter: string) => {
    if (!data) return [];

    const rows = Object.values(data?.workflows_by_cluster || {}).reduce((acc, cws) => {
        (cws.workflows || []).forEach((w) => {
            acc.push(formatRow(w));
        });

        return acc;
    }, [] as ReturnType<typeof formatRow>[]);

    const filtered = filterNouns(filter, rows);

    return orderBy(filtered, ['name', 'cluster', 'source', 'target']);
};

const formatRow = (w: pb.IWorkflow) => {
    return {
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
        _workflow: w,
    };
};
