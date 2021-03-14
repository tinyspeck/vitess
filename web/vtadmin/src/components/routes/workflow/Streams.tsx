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
import { filter, invertBy, orderBy } from 'lodash-es';
import * as React from 'react';

import { useTablets, useWorkflow } from '../../../hooks/api';
import { topodata, vtadmin as pb, vtctldata } from '../../../proto/vtadmin';
import { filterNouns } from '../../../util/filterNouns';
import { Button } from '../../Button';
import { DataTable } from '../../dataTable/DataTable';
import { Icons } from '../../Icon';
import { TabletLink } from '../../links/TabletLink';
import { TextInput } from '../../TextInput';
import style from './Streams.module.scss';

interface Props {
    clusterID: string;
    keyspace: string;
    name: string;
}

export const Streams = ({ clusterID, keyspace, name }: Props) => {
    const [filter, setFilter] = React.useState<string>('');
    const { data } = useWorkflow({ clusterID, keyspace, name }, { refetchInterval: 1000 });
    const { data: tablets = [] } = useTablets();

    const rows = Object.values(data?.workflow?.shard_streams || {}).reduce((acc, ss) => {
        (ss.streams || []).forEach((s) => acc.push(s));
        return acc;
    }, [] as vtctldata.Workflow.IStream[]);

    const filtered = filterNouns(filter, rows);

    const shardStreams = orderBy(filtered, ['state', 'shard', 'tablet.cell', 'tablet.uid']);

    return (
        <div className={style.container}>
            <div className={style.controls}>
                <TextInput
                    iconLeft={Icons.search}
                    onChange={(e) => setFilter(e.target.value)}
                    placeholder={`Filter streams in ${name}`}
                    value={filter}
                />
                <Button disabled={!filter} onClick={() => setFilter('')} secondary>
                    Clear filters
                </Button>
            </div>
            {shardStreams.map((ss) => {
                const lag =
                    typeof ss.time_updated?.seconds === 'number' &&
                    typeof ss.transaction_timestamp?.seconds === 'number'
                        ? ss.time_updated.seconds - ss.transaction_timestamp.seconds
                        : '-';
                const tablet = tablets.find(
                    (t) => t.tablet?.alias?.cell === ss.tablet?.cell && t.tablet?.alias?.uid === ss.tablet?.uid
                );

                const uad =
                    typeof ss.time_updated?.seconds === 'number' ? new Date(ss.time_updated.seconds * 1000) : null;

                return (
                    <div className={style.panel}>
                        <div className={style.row}>
                            <div className={style.field}>
                                <div className={style.label}>State</div>
                                {ss.state}
                            </div>

                            {/* <div>
                                <div className={style.label}>Stream ID</div>
                                <code>{ss.id}</code>
                            </div> */}

                            <div>
                                <div className={style.label}>Source Shard</div>
                                <code>
                                    {ss.binlog_source?.keyspace}/{ss.binlog_source?.shard}
                                </code>
                            </div>
                            <div>
                                <div className={style.label}>Target Shard</div>
                                <code>
                                    {keyspace}/{ss.shard}
                                </code>
                            </div>

                            <div>
                                <div className={style.label}>Updated at</div>
                                <code>{ss.time_updated?.seconds}</code>
                            </div>

                            <div>
                                <div className={style.label}>Replication Lag</div>
                                <code>{lag} seconds</code>
                            </div>
                        </div>

                        {/* Tablet metadata */}
                        <div className={style.row}>
                            <div className={style.field}>
                                <div className={style.label}>Tablet</div>
                                <TabletLink
                                    cell={ss.tablet?.cell}
                                    hostname={tablet?.tablet?.hostname}
                                    uid={ss.tablet?.uid}
                                >
                                    <code>
                                        {ss.tablet?.cell}-{ss.tablet?.uid} (
                                        {tablet && tablet.tablet?.type && TABLET_TYPES[tablet.tablet.type]} -{' '}
                                        {tablet && tablet.state && TABLET_STATES[tablet.state]})
                                    </code>
                                </TabletLink>
                            </div>
                        </div>

                        <div className={style.row}>
                            <div className={style.field}>
                                <div className={style.label}>Filter Rules</div>
                                <table className={style.filterTable}>
                                    <tbody>
                                        {(ss.binlog_source?.filter?.rules || []).map((f, fdx) => (
                                            <tr key={fdx}>
                                                <td>{fdx + 1}.</td>
                                                <td>
                                                    Filter: <code>{f.filter}</code>
                                                </td>
                                                <td>
                                                    Match: <code>{f.match}</code>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {ss.message && (
                            <div className={style.row}>
                                <div className={style.field}>
                                    <div className={style.label}>Message</div>
                                    <code>{ss.message}</code>
                                </div>
                            </div>
                        )}

                        <div className={style.row}>
                            <div className={style.field}>
                                <div className={style.label}>Position</div>
                                <code>{ss.position}</code>
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

// TABLET_TYPES maps numeric tablet types back to human readable strings.
// Note that topodata.TabletType allows duplicate values: specifically,
// both RDONLY (new name) and BATCH (old name) share the same numeric value.
// So, we make the assumption that if there are duplicate keys, we will
// always take the first value.
const TABLET_TYPES = Object.entries(invertBy(topodata.TabletType)).reduce((acc, [k, vs]) => {
    acc[k] = vs[0];
    return acc;
}, {} as { [k: string]: string });

const TABLET_STATES = Object.keys(pb.Tablet.ServingState);
