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
import React from 'react';
import { useSchemas } from '../../../hooks/api';
import { vtadmin as pb } from '../../../proto/vtadmin.d';
import { getTableDefinitions } from '../../../util/tableDefinitions';
import { DataCell } from '../../dataTable/DataCell';
import { DataTable } from '../../dataTable/DataTable';

interface Props {
    keyspace: pb.Keyspace | null | undefined;
}

export const KeyspaceSchemas = ({ keyspace }: Props) => {
    const { data: allSchemas = [] } = useSchemas();

    const schemas = React.useMemo(() => {
        if (!keyspace) return [];

        return getTableDefinitions(allSchemas).filter(
            (t) => t.cluster?.id === keyspace.cluster?.id && t.keyspace === keyspace?.keyspace?.name
        );
    }, [allSchemas, keyspace]);

    const renderRows = (rows: typeof schemas) => {
        return rows.map((row, rdx) => {
            return (
                <tr key={rdx}>
                    <DataCell>{row.tableDefinition?.name}</DataCell>
                </tr>
            );
        });
    };

    return (
        <div>
            <DataTable columns={['Table']} data={schemas} renderRows={renderRows} />
        </div>
    );
};
