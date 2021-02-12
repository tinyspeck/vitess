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
import 'string_score';

import { useTablets } from '../../hooks/api';
import { vtadmin as pb, topodata } from '../../proto/vtadmin';
import { orderBy } from 'lodash-es';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { DataTable } from '../dataTable/DataTable';
import { TextInput } from '../TextInput';
import { Icons } from '../Icon';
import style from './Tablets.module.scss';
import { useURLQuery } from '../../hooks/useURLQuery';
import { Button } from '../Button';

export const Tablets = () => {
    useDocumentTitle('Tablets');
    const { data = [] } = useTablets();
    const { query, pushQuery, syncQuery } = useURLQuery();

    const filter = typeof query.filter === 'string' ? query.filter : null;

    const rows = React.useMemo(() => {
        const ordered = orderBy(data, ['cluster.name', 'tablet.keyspace', 'tablet.shard', 'tablet.type']);
        if (!filter) return ordered;

        return ordered.filter((t) => {
            const alias = `${t.tablet?.alias?.cell}-${t.tablet?.alias?.uid}`;
            const shard = `${t.tablet?.keyspace}/${t.tablet?.shard}`;

            const fields = [t.tablet?.keyspace, t.tablet?.hostname, alias, shard, t.tablet?.type, t.state];

            return fields.some((f) => {
                if (typeof f !== 'string') return false;

                const threshold = 0.5;
                const fscore = (f as any).score(filter);
                return fscore > threshold;
            });
        });
    }, [data, filter]);

    const renderRows = React.useCallback((rows: pb.Tablet[]) => {
        return rows.map((t, tdx) => (
            <tr key={tdx}>
                <td>{t.cluster?.name}</td>
                <td>{t.tablet?.keyspace}</td>
                <td>{t.tablet?.shard}</td>
                <td>{formatAlias(t)}</td>
                <td>{t.tablet?.hostname}</td>
                <td>{formatType(t)}</td>
                <td>{formatState(t)}</td>
            </tr>
        ));
    }, []);

    const onChange: React.ChangeEventHandler<HTMLInputElement> = (e) => {
        syncQuery({ filter: e.target.value });
    };

    const onClickClear = (e: any) => {
        pushQuery({ filter: '' });
    };

    return (
        <div>
            <h1>Tablets</h1>
            <div className={style.controls}>
                <TextInput
                    autoFocus
                    className={style.filterInput}
                    iconLeft={Icons.search}
                    // onBlur={onBlur}
                    onChange={onChange}
                    placeholder="Filter tablets"
                    value={filter || ''}
                />
                <Button disabled={!filter} onClick={onClickClear} secondary>
                    Clear
                </Button>
            </div>
            <DataTable
                columns={['Cluster', 'Keyspace', 'Shard', 'Alias', 'Hostname', 'Type', 'State']}
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
