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
import { Link } from 'react-router-dom';
import { useTableDefinitions } from '../../hooks/api';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { prettyBytes } from '../../util/formatBytes';
import { TableDefinition } from '../../util/schemas';
import { DataTable } from '../dataTable/DataTable';

export const Schemas = () => {
    useDocumentTitle('Schemas');
    const { data = [] } = useTableDefinitions();

    const rows = React.useMemo(() => {
        return orderBy(data, ['cluster.name', 'keyspace', 'tableDefinition.name']);
    }, [data]);

    const renderRows = (rows: TableDefinition[]) =>
        rows.map((row, idx) => {
            const href =
                row.cluster?.id && row.keyspace && row.tableDefinition?.name
                    ? `/schema/${row.cluster.id}/${row.keyspace}/${row.tableDefinition.name}`
                    : null;

            const mib = prettyBytes(row.tableSize?.data_length, { precision: 0, units: 'MiB' });
            const pb = prettyBytes(row.tableSize?.data_length);

            return (
                <tr key={idx}>
                    <td>
                        <code>{row.cluster?.name}</code>
                    </td>
                    <td>
                        <code>{row.keyspace}</code>
                    </td>
                    <td>
                        <code>
                            {href ? <Link to={href}>{row.tableDefinition?.name}</Link> : row.tableDefinition?.name}
                        </code>
                    </td>
                    <td className="text-align-right">
                        <code>{pb}</code>
                        <code className="display-block font-size-small text-color-secondary">
                            {prettyBytes(row.tableSize?.data_length, { units: 'B' })}
                        </code>
                    </td>
                    <td className="text-align-right">
                        <code>
                            <div>{Number(row.tableSize?.row_count || 0).toLocaleString()}</div>
                        </code>
                    </td>
                </tr>
            );
        });

    return (
        <div className="max-width-content">
            <h1>Schemas</h1>
            <DataTable columns={['Cluster', 'Keyspace', 'Table', 'Size', 'Rows']} data={rows} renderRows={renderRows} />
        </div>
    );
};
