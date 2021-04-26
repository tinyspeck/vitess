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
import { groupBy, orderBy, sortBy } from 'lodash';
import * as React from 'react';

import style from './KeyspaceShards.module.scss';
import { useKeyspace, useTablets, useWorkflows } from '../../../hooks/api';
import { DataCell } from '../../dataTable/DataCell';
import { DataTable } from '../../dataTable/DataTable';
import { Pip } from '../../pips/Pip';
import { TabletServingPip } from '../../pips/TabletServingPip';
import { topodata, vtadmin as pb, vtctldata } from '../../../proto/vtadmin';
import { invertBy } from 'lodash-es';

interface Props {
    clusterID: string;
    name: string;
}

export const KeyspaceShards = ({ clusterID, name }: Props) => {
    const { data: keyspace, ...kq } = useKeyspace({ clusterID, name });
    const { data: tablets, ...tq } = useTablets();
    const { data: workflows, ...wq } = useWorkflows();

    const shards = React.useMemo(() => {
        const mapped = Object.values(keyspace?.shards || {}).map((s) => {
            return {
                shard: s,
                tablets: orderBy(
                    (tablets || []).filter(
                        (t) => t.cluster?.id === clusterID && t.tablet?.keyspace === name && t.tablet?.shard === s.name
                    ),
                    'tablet.type'
                ),
            };
        });
        return orderBy(mapped, 'shard.name');
    }, [clusterID, keyspace, name, tablets]);

    const streams = (workflows || [])
        .filter((wf) => wf.cluster?.id === clusterID && wf.keyspace === name)
        .reduce((acc, wf) => {
            Object.entries(wf.workflow?.shard_streams || {}).forEach(([sk, ss]) => {
                (ss.streams || []).forEach((sss) => acc.push(sss));
            });
            return acc;
        }, [] as vtctldata.Workflow.IStream[]);

    const renderRows = (rows: typeof shards) => {
        return rows.reduce((acc, row) => {
            if (!row.tablets.length) {
                acc.push(
                    <tr key={row.shard.name}>
                        <DataCell>
                            <div>
                                <Pip state={row.shard?.shard?.is_master_serving ? 'success' : 'danger'} />{' '}
                                {row.shard.name}({row.shard.shard?.is_master_serving ? 'SERVING' : 'NOT SERVING'})
                            </div>
                        </DataCell>
                        <DataCell colSpan={4}>No tablets</DataCell>
                    </tr>
                );
                return acc;
            }

            const tabletsByType = groupBy(row.tablets, (t) => formatDisplayType(t));

            row.tablets.forEach((t, tdx) => {
                const tabletStreams = streams.filter(
                    (s) => s.tablet?.cell === t.tablet?.alias?.cell && s.tablet?.uid === t.tablet?.alias?.uid
                );

                const streamsByState = groupBy(tabletStreams, 'state');

                acc.push(
                    <tr key={`${row.shard.name}--${t.tablet?.hostname}`}>
                        {tdx === 0 && (
                            <>
                                <DataCell rowSpan={row.tablets.length || 1}>
                                    <div>
                                        <Pip state={row.shard?.shard?.is_master_serving ? 'success' : 'danger'} />{' '}
                                        <span className={style.shardName}>{row.shard.name}</span> (
                                        {row.shard.shard?.is_master_serving ? 'SERVING' : 'NOT SERVING'})
                                    </div>

                                    <div className={style.tabletCounts}>
                                        {Object.entries(tabletsByType).map(([k, kt]) => (
                                            <div>
                                                {kt.length} {kt.length === 1 ? k : `${k}S`}
                                            </div>
                                        ))}
                                    </div>
                                </DataCell>
                            </>
                        )}
                        <DataCell className="white-space-nowrap">
                            <TabletServingPip state={t.state} /> {formatDisplayType(t)}
                        </DataCell>
                        <DataCell>{formatState(t)}</DataCell>
                        <DataCell>{formatAlias(t)}</DataCell>
                        <DataCell>{t.tablet?.hostname}</DataCell>
                        <DataCell>
                            {Object.entries(streamsByState).map(([streamState, streams]) => (
                                <div key={streamState}>
                                    {streams.length} <code>{streamState}</code> VReplication streams
                                </div>
                            ))}
                        </DataCell>
                    </tr>
                );
            });
            return acc;
        }, [] as JSX.Element[]);
    };

    return (
        <div>
            <DataTable
                columns={['Shard', 'Tablet Type', 'State', 'Alias', 'Hostname', '']}
                data={shards}
                renderRows={renderRows}
            />
        </div>
    );
};

const SERVING_STATES = Object.keys(pb.Tablet.ServingState);

// TABLET_TYPES maps numeric tablet types back to human readable strings.
// Note that topodata.TabletType allows duplicate values: specifically,
// both RDONLY (new name) and BATCH (old name) share the same numeric value.
// So, we make the assumption that if there are duplicate keys, we will
// always take the first value.
const TABLET_TYPES = Object.entries(invertBy(topodata.TabletType)).reduce((acc, [k, vs]) => {
    acc[k] = vs[0];
    return acc;
}, {} as { [k: string]: string });

const formatAlias = (t: pb.Tablet) =>
    t.tablet?.alias?.cell && t.tablet?.alias?.uid && `${t.tablet.alias.cell}-${t.tablet.alias.uid}`;

const formatType = (t: pb.Tablet) => {
    return t.tablet?.type && TABLET_TYPES[t.tablet?.type];
};

const formatDisplayType = (t: pb.Tablet) => {
    const tt = formatType(t);
    return tt === 'MASTER' ? 'PRIMARY' : tt;
};

const formatState = (t: pb.Tablet) => t.state && SERVING_STATES[t.state];
