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

import { useTablets } from '../../../hooks/api';
import { vtadmin as pb } from '../../../proto/vtadmin.d';
import { DataCell } from '../../dataTable/DataCell';
import { DataTable } from '../../dataTable/DataTable';

interface Props {
    keyspace: pb.Keyspace | null | undefined;
}

export const KeyspaceShards = ({ keyspace }: Props) => {
    const { data: tablets = [], ...tq } = useTablets();

    const tableData = React.useMemo(() => {
        if (!keyspace || tq.isLoading) {
            return [];
        }

        return Object.values(keyspace.shards).map((shard) => ({
            shard: shard.name,
            tablets: tablets,
        }));
    }, [keyspace, tablets, tq.isLoading]);

    if (!keyspace) {
        return null;
    }

    const renderRows = (rows: typeof tableData) => {
        return rows.map((row) => {
            return (
                <tr key={row.shard}>
                    <DataCell>{row.shard}</DataCell>
                </tr>
            );
        });
    };

    return (
        <div>
            <DataTable columns={['Shard']} data={tableData} renderRows={renderRows} />
        </div>
    );
};
