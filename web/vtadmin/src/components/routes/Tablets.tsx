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

import { useTablets } from '../../hooks/api';
import { vtadmin as pb, topodata } from '../../proto/vtadmin';
import { groupBy, orderBy } from 'lodash-es';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { DataTable } from '../dataTable/DataTable';
import { DataCell } from '../dataTable/DataCell';

export const Tablets = () => {
    useDocumentTitle('Tablets');
    const { data = [] } = useTablets();

    const rows = React.useMemo(() => {
        return orderBy(data, ['cluster.name', 'tablet.keyspace', 'tablet.shard', 'tablet.type']);
    }, [data]);

    const renderRows = (tablets: pb.Tablet[]) => {
        return Object.entries(groupBy(tablets, 'cluster.name')).reduce((acc, [clusterName, tabletsForCluster]) => {
            Object.entries(groupBy(tabletsForCluster, 'tablet.keyspace')).forEach(([keyspace, tabletsForKeyspace]) => {
                let kdx = 0;

                Object.entries(groupBy(tabletsForKeyspace, 'tablet.shard')).forEach(([shard, tabletsForShard]) => {
                    let sdx = 0;

                    tabletsForShard.forEach((t, tdx) => {
                        const alias = formatAlias(t);
                        acc.push(
                            <tr key={alias}>
                                {kdx === 0 && (
                                    <DataCell rowSpan={tabletsForKeyspace.length}>{t.cluster?.name}</DataCell>
                                )}
                                {sdx === 0 && (
                                    <DataCell rowSpan={tabletsForShard.length}>{t.tablet?.keyspace}</DataCell>
                                )}
                                {tdx === 0 && <DataCell rowSpan={tabletsForShard.length}>{t.tablet?.shard}</DataCell>}
                                <DataCell>{formatType(t)}</DataCell>
                                <DataCell>{formatState(t)}</DataCell>
                                <DataCell>{formatAlias(t)}</DataCell>
                                <DataCell>{t.tablet?.hostname}</DataCell>
                            </tr>
                        );

                        kdx++;
                        sdx++;
                    });
                });
            });

            return acc;
        }, [] as JSX.Element[]);
    };

    return (
        <div>
            <h1>Tablets</h1>
            <DataTable
                columns={['Cluster', 'Keyspace', 'Shard', 'Type', 'State', 'Alias', 'Hostname']}
                data={rows}
                renderRows={renderRows}
            />
        </div>
    );
};

const SERVING_STATES = Object.keys(pb.Tablet.ServingState);
const TABLET_TYPES = Object.keys(topodata.TabletType);

const formatAlias = (t: pb.Tablet) =>
    t.tablet?.alias?.cell && t.tablet?.alias?.uid && `${t.tablet.alias.cell}-${t.tablet.alias.uid}`;

const formatType = (t: pb.Tablet) => t.tablet?.type && TABLET_TYPES[t.tablet?.type];

const formatState = (t: pb.Tablet) => t.state && SERVING_STATES[t.state];
