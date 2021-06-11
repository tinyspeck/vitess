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

import { useSchemas } from '../../hooks/api';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { useSyncedURLParam } from '../../hooks/useSyncedURLParam';
import { filterNouns } from '../../util/filterNouns';
import { formatBytes } from '../../util/formatBytes';
import { getTableDefinitions } from '../../util/tableDefinitions';
import { DataCell } from '../dataTable/DataCell';
import { DataFilter } from '../dataTable/DataFilter';
import { DataTable } from '../dataTable/DataTable';
import { DataTable2 } from '../dataTable/DataTable2';
import { ContentContainer } from '../layout/ContentContainer';
import { WorkspaceHeader } from '../layout/WorkspaceHeader';
import { WorkspaceTitle } from '../layout/WorkspaceTitle';
import { KeyspaceLink } from '../links/KeyspaceLink';
import { HelpTooltip } from '../tooltip/HelpTooltip';

const TABLE_COLUMNS = [
    'Keyspace',
    'Table',
    <div className="text-align-right">
        Approx. Size{' '}
        <HelpTooltip
            text={
                <span>
                    Size is an approximate value derived from{' '}
                    <span className="font-family-monospace">INFORMATION_SCHEMA</span>.
                </span>
            }
        />
    </div>,
    <div className="text-align-right">
        Approx. Rows{' '}
        <HelpTooltip
            text={
                // c.f. https://dev.mysql.com/doc/refman/5.7/en/information-schema-tables-table.html
                <span>
                    Row count is an approximate value derived from{' '}
                    <span className="font-family-monospace">INFORMATION_SCHEMA</span>. Actual values may vary by as much
                    as 40% to 50%.
                </span>
            }
        />
    </div>,
];

export const Schemas = () => {
    useDocumentTitle('Schemas');

    const { data: schemas = [] } = useSchemas();
    const { value: filter, updateValue: updateFilter } = useSyncedURLParam('filter');

    const data = React.useMemo(() => {
        const tableDefinitions = getTableDefinitions(schemas);

        const mapped = tableDefinitions.map((d) => {
            const href =
                d.cluster?.id && d.keyspace && d.tableDefinition?.name
                    ? `/schema/${d.cluster?.id}/${d.keyspace}/${d.tableDefinition?.name}`
                    : null;
            return {
                cluster: d.cluster?.name,
                clusterID: d.cluster?.id,
                href,
                keyspace: d.keyspace,
                keyspaceID: `${d.cluster?.name}-${d.keyspace}`,
                rowCount: d.tableSize?.row_count || 0,
                size: formatBytes(d.tableSize?.data_length),
                sizeB: formatBytes(d.tableSize?.data_length, 'B'),
                sizeNum: d.tableSize?.data_length || 0,
                table: d.tableDefinition?.name,
                _raw: d,
            };
        });
        return mapped;
        // const filtered = filterNouns(filter, mapped);
        // return orderBy(filtered, ['cluster', 'keyspace', 'table']);
    }, [schemas]);

    const columns: any = React.useMemo(() => {
        return [
            {
                Header: 'Keyspace',
                id: 'keyspaceID',
                accessor: 'keyspaceID',
                Cell: ({ row: { original: row } }: any) => {
                    return (
                        <KeyspaceLink clusterID={row.clusterID} name={row.keyspace}>
                            <div>{row.keyspace}</div>
                            <div className="font-size-small text-color-secondary">{row.cluster}</div>
                        </KeyspaceLink>
                    );
                },
            },
            {
                Header: 'Table',
                id: 'table',
                accessor: 'table',
                Cell: ({ row: { original: row } }: any) => {
                    return <span>{row.href ? <Link to={row.href}>{row.table}</Link> : row.table}</span>;
                },
            },
            {
                Header: 'Approx. Size',
                accessor: 'sizeNum',
            },
            {
                Header: 'Approx. Rows',
                accessor: 'rowCount',
            },
        ];
    }, []);

    // const filteredData = React.useMemo(() => {
    //     const tableDefinitions = getTableDefinitions(data);

    //     const mapped = tableDefinitions.map((d) => ({
    //         cluster: d.cluster?.name,
    //         clusterID: d.cluster?.id,
    //         keyspace: d.keyspace,
    //         table: d.tableDefinition?.name,
    //         _raw: d,
    //     }));

    //     const filtered = filterNouns(filter, mapped);
    //     return orderBy(filtered, ['cluster', 'keyspace', 'table']);
    // }, [data, filter]);

    // const renderRows = (rows: typeof filteredData) =>
    //     rows.map((row, idx) => {
    //         const href =
    //             row.clusterID && row.keyspace && row.table
    //                 ? `/schema/${row.clusterID}/${row.keyspace}/${row.table}`
    //                 : null;
    //         return (
    //             <tr key={idx}>
    //                 <DataCell>
    //                     <KeyspaceLink clusterID={row.clusterID} name={row.keyspace}>
    //                         <div>{row.keyspace}</div>
    //                         <div className="font-size-small text-color-secondary">{row.cluster}</div>
    //                     </KeyspaceLink>
    //                 </DataCell>
    //                 <DataCell className="font-weight-bold">
    //                     {href ? <Link to={href}>{row.table}</Link> : row.table}
    //                 </DataCell>
    //                 <DataCell className="text-align-right">
    //                     <div>{formatBytes(row._raw.tableSize?.data_length)}</div>
    //                     <div className="font-size-small text-color-secondary">
    //                         {formatBytes(row._raw.tableSize?.data_length, 'B')}
    //                     </div>
    //                 </DataCell>
    //                 <DataCell className="text-align-right">
    //                     {(row._raw.tableSize?.row_count || 0).toLocaleString()}
    //                 </DataCell>
    //             </tr>
    //         );
    //     });

    return (
        <div>
            <WorkspaceHeader>
                <WorkspaceTitle>Schemas</WorkspaceTitle>
            </WorkspaceHeader>
            <ContentContainer>
                <DataFilter
                    autoFocus
                    onChange={(e) => updateFilter(e.target.value)}
                    onClear={() => updateFilter('')}
                    placeholder="Filter schemas"
                    value={filter || ''}
                />

                <DataTable2
                    columns={columns}
                    data={data}
                    filter={filter}
                    initialState={{
                        sortBy: [{ id: 'keyspaceID' }, { id: 'table' }],
                    }}
                />

                {/* <DataTable columns={TABLE_COLUMNS} data={filteredData} renderRows={renderRows} /> */}
            </ContentContainer>
        </div>
    );
};
