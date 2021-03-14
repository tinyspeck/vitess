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

import { useTablets, useWorkflow } from '../../../hooks/api';
import { vtctldata } from '../../../proto/vtadmin';
import { filterNouns } from '../../../util/filterNouns';
import { Button } from '../../Button';
import { Icons } from '../../Icon';
import { TextInput } from '../../TextInput';
import { Stream } from './Stream';
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
                const tablet = tablets.find(
                    (t) => t.tablet?.alias?.cell === ss.tablet?.cell && t.tablet?.alias?.uid === ss.tablet?.uid
                );

                return <Stream keyspace={keyspace} stream={ss} tablet={tablet} />;
            })}
        </div>
    );
};
