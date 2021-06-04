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

import React from 'react';
import { useExperimentalTabletDebugVars, useTablet } from '../../../hooks/api';
import { Button } from '../../Button';
import { TabletQPSChart } from '../../charts/TabletQPSChart';
import { TabletVReplicationQPSChart } from '../../charts/TabletVReplicationQPSChart';
import { Code } from '../../Code';
import { WorkspaceSidebarHeader } from '../../layout/WorkspaceSidebarHeader';
import style from './WorkflowTabletSidebar.module.scss';

interface Props {
    alias: string;
    clusterID: string;
    onClose?: () => void;
}

export const WorkflowTabletSidebar = ({ alias, clusterID, onClose }: Props) => {
    const { data: tablet, ...tq } = useTablet({ alias, clusterID });
    const { data: debugVars } = useExperimentalTabletDebugVars({ alias, clusterID });

    return (
        <div className={style.container}>
            <WorkspaceSidebarHeader onClose={onClose} title={alias}>
                <div className={style.header}>
                    <Button secondary size="small">
                        View details
                    </Button>
                </div>
            </WorkspaceSidebarHeader>

            <div className={style.content}>
                <section>
                    <div className={style.sectionTitle}>QPS</div>
                    <div className={style.chart}>
                        <TabletQPSChart
                            alias={alias}
                            clusterID={clusterID}
                            options={{ chart: { height: 240 }, legend: { enabled: false } }}
                        />
                    </div>
                </section>
                <section>
                    <div className={style.sectionTitle}>VReplication QPS</div>
                    <div className={style.chart}>
                        <TabletVReplicationQPSChart
                            alias={alias}
                            clusterID={clusterID}
                            options={{ chart: { height: 240 }, legend: { enabled: false } }}
                        />
                    </div>
                </section>
                <section>
                    <div className={style.sectionTitle}>Debug</div>

                    <Code code={JSON.stringify(tablet, null, 2)} />
                    <Code code={JSON.stringify(debugVars, null, 2)} />
                </section>
            </div>
        </div>
    );
};
