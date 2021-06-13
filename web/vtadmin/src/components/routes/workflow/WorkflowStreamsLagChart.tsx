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

import { useMemo } from 'react';

import { useAllExperimentalTabletDebugVars, useWorkflow } from '../../../hooks/api';
import { getStreamVReplicationLagTimeseries, QPS_REFETCH_INTERVAL } from '../../../util/tabletDebugVars';
import { getStreamTablets } from '../../../util/workflows';
import { mergeOptions } from '../../charts/chartOptions';
import { Timeseries } from '../../charts/Timeseries';

interface Props {
    clusterID: string;
    keyspace: string;
    workflowName: string;
}

export const WorkflowStreamsLagChart = ({ clusterID, keyspace, workflowName }: Props) => {
    const { data: workflow, ...wq } = useWorkflow({ clusterID, keyspace, name: workflowName });
    const aliases = useMemo(() => getStreamTablets(workflow), [workflow]);
    const queryParams = useMemo(
        () =>
            aliases.map((alias) => ({
                alias,
                clusterID: workflow?.cluster?.id as string,
            })),
        [aliases, workflow]
    );

    const tabletQueries = useAllExperimentalTabletDebugVars(queryParams, {
        enabled: !!workflow,
        refetchInterval: QPS_REFETCH_INTERVAL,
        refetchIntervalInBackground: true,
    });

    const anyLoading = wq.isLoading || tabletQueries.some((q) => q.isLoading);

    const chartOptions: any = useMemo(() => {
        const series = tabletQueries.reduce((acc, { data }: any) => {
            if (!data) {
                return acc;
            }

            const { params, data: qData } = data;

            const lagSeries = getStreamVReplicationLagTimeseries(qData);
            Object.entries(lagSeries).forEach(([streamID, qpsData]) => {
                // Don't graph aggregate stream data for the tablet
                if (streamID === 'All') {
                    return;
                }

                acc.push({
                    data: qpsData,
                    name: `${params?.alias}/${streamID}`,
                    type: 'line',
                });
            });

            return acc;
        }, [] as Highcharts.SeriesOptionsType[]);

        return mergeOptions({
            series,
            yAxis: {
                labels: {
                    format: '{text} s',
                },
            },
        });
    }, [tabletQueries]);

    return <Timeseries isLoading={anyLoading} options={chartOptions} />;
};
