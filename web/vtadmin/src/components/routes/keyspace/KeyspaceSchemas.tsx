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
import { useSchemas } from '../../../hooks/api';
import { DataCell } from '../../dataTable/DataCell';
import { DataTable } from '../../dataTable/DataTable';

interface Props {
    clusterID: string;
    name: string;
}

export const KeyspaceSchemas = ({ clusterID, name }: Props) => {
    const { data: schemas, ...sq } = useSchemas();
    const ks = (schemas || []).find((s) => s.cluster?.id === clusterID && s.keyspace === name);

    if (sq.isLoading) {
        return <div>Loading</div>;
    }

    const tables = (ks?.table_definitions || []).map((td) => ({
        ...td,
    }));

    console.log(tables);

    const renderRows = (rows: typeof tables) => {
        return rows.map((row) => {
            return (
                <tr key={row.name}>
                    <DataCell className="font-weight-bold">
                        <Link to={`/schema/${clusterID}/${name}/${row.name}`}>{row.name}</Link>
                    </DataCell>
                    <DataCell>TODO</DataCell>
                    <DataCell>TODO</DataCell>
                </tr>
            );
        });
    };

    return (
        <div>
            <DataTable columns={['Table', 'Approx. Size', 'Approx. Rows']} data={tables} renderRows={renderRows} />
        </div>
    );
};
