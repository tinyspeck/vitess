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

import style from './WorkflowTablets.module.scss';
import { useTablets } from '../../../hooks/api';
import { vtadmin } from '../../../proto/vtadmin';
import { formatAlias, formatDisplayType } from '../../../util/tablets';
import { TabletQPSChart } from '../../charts/TabletQPSChart';
import { DataCell } from '../../dataTable/DataCell';
import { DataTable } from '../../dataTable/DataTable';
import { ExternalTabletLink } from '../../links/ExternalTabletLink';
import { TabletLink } from '../../links/TabletLink';

interface Props {
    workflow: vtadmin.Workflow | null | undefined;
}

const COLUMNS = ['Tablet', 'Hostname', 'Type', 'QPS'];

export const WorkflowTablets = ({ workflow }: Props) => {
    const clusterID = workflow?.cluster?.id as string;

    const { data: tablets = [] } = useTablets();

    const sourceShards = workflow?.workflow?.source?.shards || [];
    const targetShards = workflow?.workflow?.target?.shards || [];

    const sourceKeyspace = workflow?.workflow?.source?.keyspace;
    const targetKeyspace = workflow?.workflow?.target?.keyspace;

    const sourceTablets = tablets?.filter(
        (t) =>
            t.cluster?.id === workflow?.cluster?.id &&
            t.tablet?.keyspace === sourceKeyspace &&
            t.tablet?.shard &&
            sourceShards.indexOf(t.tablet?.shard) >= 0
    );

    const targetTablets = tablets?.filter(
        (t) =>
            t.cluster?.id === workflow?.cluster?.id &&
            t.tablet?.keyspace === targetKeyspace &&
            t.tablet?.shard &&
            targetShards.indexOf(t.tablet?.shard) >= 0
    );

    const renderRows = (rows: typeof sourceTablets) => {
        return rows?.map((row) => {
            const alias = formatAlias(row.tablet?.alias) as string;

            return (
                <tr key={alias}>
                    <DataCell>
                        <TabletLink alias={alias} clusterID={clusterID}>
                            {alias}
                        </TabletLink>
                    </DataCell>
                    <DataCell>
                        <ExternalTabletLink fqdn={row.FQDN}>{row.tablet?.hostname}</ExternalTabletLink>
                    </DataCell>
                    <DataCell>{formatDisplayType(row)}</DataCell>
                    <DataCell>
                        <TabletQPSChart alias={alias} clusterID={clusterID} sparkline />
                    </DataCell>
                </tr>
            );
        });
    };

    return (
        <div>
            <div className={style.tableContainer}>
                <DataTable columns={COLUMNS} data={sourceTablets} renderRows={renderRows} title="Source tablets" />
            </div>
            <div className={style.tableContainer}>
                <DataTable columns={COLUMNS} data={targetTablets} renderRows={renderRows} title="Target tablets" />
            </div>
        </div>
    );
};
