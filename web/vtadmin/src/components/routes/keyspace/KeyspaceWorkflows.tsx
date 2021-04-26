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
import { Link } from 'react-router-dom';
import { useKeyspace, useWorkflows } from '../../../hooks/api';
import { vtadmin } from '../../../proto/vtadmin';
import { DataCell } from '../../dataTable/DataCell';
import { DataTable } from '../../dataTable/DataTable';

interface Props {
    clusterID: string;
    name: string;
}

export const KeyspaceWorkflows = ({ clusterID, name }: Props) => {
    const { data: keyspace, ...ksQuery } = useKeyspace({ clusterID, name });
    const { data: workflows, ...wq } = useWorkflows();

    const workflowsForKs: vtadmin.Workflow[] = (workflows || []).filter(
        (w) =>
            w.cluster?.id === clusterID &&
            (w.workflow?.source?.keyspace === name || w.workflow?.target?.keyspace === name)
    );

    const renderRows = (rows: typeof workflowsForKs) => {
        return rows.map((row) => {
            const href =
                row.cluster?.id && row.keyspace && row.workflow?.name
                    ? `/workflow/${row.cluster.id}/${row.keyspace}/${row.workflow?.name}`
                    : null;

            return (
                <tr key={row.workflow?.name}>
                    <DataCell>
                        <div className="font-weight-bold">
                            {href ? <Link to={href}>{row.workflow?.name}</Link> : row.workflow?.name}
                        </div>
                    </DataCell>
                    <DataCell>
                        {row.workflow?.source ? (
                            <>
                                <div>{row.workflow?.source?.keyspace}</div>
                                <div className="font-size-small text-color-secondary">
                                    {(row.workflow?.source?.shards || []).join(', ')}
                                </div>
                            </>
                        ) : (
                            <span className="text-color-secondary">N/A</span>
                        )}
                    </DataCell>
                    <DataCell>
                        {row.workflow?.target ? (
                            <>
                                <div>{row.workflow?.target?.keyspace}</div>
                                <div className="font-size-small text-color-secondary">
                                    {(row.workflow?.target.shards || []).join(', ')}
                                </div>
                            </>
                        ) : (
                            <span className="text-color-secondary">N/A</span>
                        )}
                    </DataCell>
                </tr>
            );
        });
    };

    return (
        <div>
            <DataTable columns={['Workflow', 'Source', 'Target']} data={workflowsForKs} renderRows={renderRows} />
        </div>
    );
};
