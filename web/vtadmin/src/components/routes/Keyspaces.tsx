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
import { useKeyspaces } from '../../hooks/api';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { vtadmin as pb } from '../../proto/vtadmin';
import { DataTable } from '../dataTable/DataTable';
import style from './Keyspaces.module.scss';

export const Keyspaces = () => {
    useDocumentTitle('Keyspaces');
    const { data } = useKeyspaces();

    const rows = React.useMemo(() => {
        return orderBy(data, ['cluster.name', 'keyspace.name']);
    }, [data]);

    const renderRows = (rows: pb.Keyspace[]) =>
        rows.map((keyspace, idx) => (
            <tr key={idx}>
                <td>
                    <code>{keyspace.cluster?.name}</code>
                </td>
                <td>
                    <Link to={`/keyspace/${keyspace.cluster?.id}/${keyspace.keyspace?.name}`}>
                        <code className="font-weight-bold">{keyspace.keyspace?.name}</code>
                    </Link>
                </td>
            </tr>
        ));

    return (
        <div className={style.container}>
            <h1>Keyspaces</h1>
            <DataTable columns={['Cluster', 'Keyspace']} data={rows} renderRows={renderRows} />
        </div>
    );
};
