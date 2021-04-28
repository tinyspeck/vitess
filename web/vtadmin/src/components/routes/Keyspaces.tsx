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

import style from './Keyspaces.module.scss';
import { useKeyspaces } from '../../hooks/api';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { useSyncedURLParam } from '../../hooks/useSyncedURLParam';
import { DataCell } from '../dataTable/DataCell';
import { DataTable } from '../dataTable/DataTable';
import { Button } from '../Button';
import { Icons } from '../Icon';
import { TextInput } from '../TextInput';
import { Pip } from '../pips/Pip';
import { filterNouns } from '../../util/filterNouns';
import { getShardsByState } from '../../util/keyspaces';

export const Keyspaces = () => {
    useDocumentTitle('Keyspaces');
    const { value: filter, updateValue: updateFilter } = useSyncedURLParam('filter');

    const { data } = useKeyspaces();

    const ksRows = React.useMemo(() => {
        const mapped = (data || []).map((k) => {
            const shardsByState = getShardsByState(k);

            return {
                clusterID: k.cluster?.id,
                cluster: k.cluster?.name,
                name: k.keyspace?.name,
                servingShards: shardsByState.serving.length,
                nonservingShards: shardsByState.nonserving.length,
            };
        });
        const filtered = filterNouns(filter, mapped);
        return orderBy(filtered, ['cluster', 'name']);
    }, [data, filter]);

    const renderRows = (rows: typeof ksRows) =>
        rows.map((row, idx) => (
            <tr key={idx}>
                <DataCell>
                    <div className="font-weight-bold">{row.name}</div>
                    <div className="font-size-small text-color-secondary">{row.cluster}</div>
                </DataCell>
                <DataCell>
                    {!!row.servingShards && (
                        <div>
                            <Pip state="success" /> {row.servingShards} {row.servingShards === 1 ? 'shard' : 'shards'}
                        </div>
                    )}
                    {!!row.nonservingShards && (
                        <div className="font-weight-bold">
                            <Pip state="danger" /> {row.nonservingShards}{' '}
                            {row.nonservingShards === 1 ? 'shard' : 'shards'} not serving
                        </div>
                    )}
                </DataCell>
            </tr>
        ));

    return (
        <div className="max-width-content">
            <h1>Keyspaces</h1>
            <div className={style.controls}>
                <TextInput
                    autoFocus
                    iconLeft={Icons.search}
                    onChange={(e) => updateFilter(e.target.value)}
                    placeholder="Filter keyspaces"
                    value={filter || ''}
                />
                <Button disabled={!filter} onClick={() => updateFilter('')} secondary>
                    Clear filters
                </Button>
            </div>
            <DataTable columns={['Keyspace', 'Shards']} data={ksRows} renderRows={renderRows} />
        </div>
    );
};
