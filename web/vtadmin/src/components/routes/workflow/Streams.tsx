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
import { filter, orderBy } from 'lodash-es';
import * as React from 'react';

import { useWorkflow } from '../../../hooks/api';
import { vtadmin as pb, vtctldata } from '../../../proto/vtadmin';
import { filterNouns } from '../../../util/filterNouns';
import { Button } from '../../Button';
import { DataTable } from '../../dataTable/DataTable';
import { Icons } from '../../Icon';
import { TextInput } from '../../TextInput';
import style from './Streams.module.scss';

interface Props {
    clusterID: string;
    keyspace: string;
    name: string;
}

export const Streams = ({ clusterID, keyspace, name }: Props) => {
    const [filter, setFilter] = React.useState<string>('');
    const { data } = useWorkflow({ clusterID, keyspace, name });

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
                    autoFocus
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

                return (
                    <div className={style.panel}>
                        <div className={style.row}>
                            <div className={style.field}>
                                <div className={style.label}>State</div>
                                {ss.state}
                            </div>

                            <div>
                                <div className={style.label}>Stream ID</div>
                                <code>{ss.id}</code>
                            </div>

                            <div>
                                <div className={style.label}>Source Shard</div>
                                <code>
                                    {keyspace}/{ss.shard}
                                </code>
                            </div>
                            <div>
                                <div className={style.label}>Target Shard</div>
                                <code>
                                    {keyspace}/{ss.shard}
                                </code>
                            </div>
                            <div>
                                <div className={style.label}>Replication Lag</div>
                                <code>{lag} seconds</code>
                            </div>
                        </div>

                        <div className={style.row}>
                            <div className={style.field}>
                                <div className={style.label}>Filter Rules</div>
                                <table className={style.filterTable}>
                                    <tbody>
                                        {(ss.binlog_source?.filter?.rules || []).map((f, fdx) => (
                                            <tr>
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
