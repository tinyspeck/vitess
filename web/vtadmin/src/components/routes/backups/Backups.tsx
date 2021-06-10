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

import React, { useMemo } from 'react';

import style from './Backups.module.scss';
import { useBackups } from '../../../hooks/api';
import { getBackups } from '../../../util/backups';
import { DataCell } from '../../dataTable/DataCell';
import { DataTable } from '../../dataTable/DataTable';
import { ContentContainer } from '../../layout/ContentContainer';
import { WorkspaceHeader } from '../../layout/WorkspaceHeader';
import { WorkspaceTitle } from '../../layout/WorkspaceTitle';
import { useDocumentTitle } from '../../../hooks/useDocumentTitle';
import { useSyncedURLParam } from '../../../hooks/useSyncedURLParam';
import { DataFilter } from '../../dataTable/DataFilter';
import { formatDateTime, formatRelativeTime } from '../../../util/time';
import { orderBy } from 'lodash-es';
import { formatAlias } from '../../../util/tablets';
import { filterNouns } from '../../../util/filterNouns';
import { TabletLink } from '../../links/TabletLink';
import { KeyspaceLink } from '../../links/KeyspaceLink';

const COLUMNS = ['Time', 'Directory', 'Name', 'Tablet'];

export const Backups = () => {
    useDocumentTitle('Backups');
    const { value: filter, updateValue: updateFilter } = useSyncedURLParam('filter');

    const { data } = useBackups();

    const backups = useMemo(() => {
        const rows = getBackups(data).map((b) => {
            const ts = b.backup?.time?.seconds;
            return {
                clusterID: b.clusterID,
                directory: b.backup?.directory,
                displayTime: formatDateTime(ts),
                keyspace: b.backup?.keyspace,
                name: b.backup?.name,
                shard: b.backup?.shard,
                tablet: formatAlias(b.backup?.tablet_alias),
                time: ts,
            };
        });

        const filtered = filterNouns(filter, rows);
        const sorted = orderBy(filtered, ['time', 'directory', 'clusterID', 'name'], ['desc']);
        return sorted;
    }, [data, filter]);

    const renderRows = (rows: typeof backups) => {
        return rows.map((row, rdx) => {
            const key = `${row.clusterID}-${row.keyspace}-${rdx}`;
            return (
                <tr key={key}>
                    <DataCell>
                        {row.displayTime}
                        <div className="font-size-small text-color-secondary">{formatRelativeTime(row.time)}</div>
                    </DataCell>
                    <DataCell>
                        <KeyspaceLink clusterID={row.clusterID} name={row.keyspace} shard={row.shard}>
                            <div>{row.directory}</div>
                            <div className="font-size-small text-color-secondary">{row.clusterID}</div>
                        </KeyspaceLink>
                    </DataCell>
                    <DataCell>{row.name}</DataCell>
                    <DataCell>
                        <TabletLink alias={row.tablet} clusterID={row.clusterID}>
                            {row.tablet}
                        </TabletLink>
                    </DataCell>
                </tr>
            );
        });
    };

    return (
        <div>
            <WorkspaceHeader>
                <WorkspaceTitle>Backups</WorkspaceTitle>
            </WorkspaceHeader>
            <ContentContainer>
                <DataFilter
                    autoFocus
                    onChange={(e) => updateFilter(e.target.value)}
                    onClear={() => updateFilter('')}
                    placeholder="Filter backups"
                    value={filter || ''}
                />
                <div className={style.container}>
                    <DataTable columns={COLUMNS} data={backups} renderRows={renderRows} />
                </div>
            </ContentContainer>
        </div>
    );
};
