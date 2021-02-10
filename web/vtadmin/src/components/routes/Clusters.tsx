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
import { useClusters } from '../../hooks/api';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { DataTable } from '../dataTable/DataTable';

export const Clusters = () => {
    useDocumentTitle('Clusters');
    const { data } = useClusters();

    const rows = React.useMemo(() => {
        return orderBy(data, ['name']);
    }, [data]);

    return (
        <div>
            <h1>Clusters</h1>
            <DataTable
                columns={['Name', 'ID']}
                data={rows}
                renderRows={(rows) =>
                    rows.map((cluster, idx) => (
                        <tr key={idx}>
                            <td>{cluster.name}</td>
                            <td>{cluster.id}</td>
                        </tr>
                    ))
                }
            />
        </div>
    );
};
