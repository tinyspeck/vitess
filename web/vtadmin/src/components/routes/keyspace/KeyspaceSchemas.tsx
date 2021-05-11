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
import React from 'react';
import { Link } from 'react-router-dom';
import { useSchemas } from '../../../hooks/api';
import { vtadmin as pb } from '../../../proto/vtadmin.d';
import { formatBytes } from '../../../util/formatBytes';
import { getTableDefinitions } from '../../../util/tableDefinitions';
import { DataCell } from '../../dataTable/DataCell';
import { DataTable } from '../../dataTable/DataTable';
import { HelpTooltip } from '../../tooltip/HelpTooltip';

interface Props {
    keyspace: pb.Keyspace | null | undefined;
}

const TABLE_COLUMNS = [
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
export const KeyspaceSchemas = ({ keyspace }: Props) => {
    const { data: allSchemas = [] } = useSchemas();

    const schemas = React.useMemo(() => {
        if (!keyspace) return [];

        return orderBy(
            getTableDefinitions(allSchemas).filter(
                (t) => t.cluster?.id === keyspace.cluster?.id && t.keyspace === keyspace?.keyspace?.name
            ),
            ['tableDefinition.name']
        );
    }, [allSchemas, keyspace]);

    const renderRows = (rows: typeof schemas) => {
        return rows.map((row, rdx) => {
            return (
                <tr key={rdx}>
                    <DataCell>
                        <Link
                            className="font-weight-bold"
                            to={`/schema/${row.cluster?.id}/${row.keyspace}/${row.tableDefinition?.name}`}
                        >
                            {row.tableDefinition?.name}
                        </Link>
                    </DataCell>
                    <DataCell className="text-align-right">
                        <div>{formatBytes(row.tableSize?.data_length)}</div>
                        <div className="font-size-small text-color-secondary">
                            {formatBytes(row.tableSize?.data_length, 'B')}
                        </div>
                    </DataCell>
                    <DataCell className="text-align-right">{(row.tableSize?.row_count || 0).toLocaleString()}</DataCell>
                </tr>
            );
        });
    };

    return (
        <div>
            <DataTable columns={TABLE_COLUMNS} data={schemas} renderRows={renderRows} />
        </div>
    );
};
