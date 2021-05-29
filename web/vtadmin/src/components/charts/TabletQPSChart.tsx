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

import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';
import { useMemo } from 'react';
import { useExperimentalTabletDebugVars } from '../../hooks/api';
import { ratesToTimeseries } from '../../util/timeseries';
import { mergeOptions } from './options';

interface Props {
    alias: string;
    chartOptions?: Highcharts.Options;
    clusterID: string;
}

export const TabletQPSChart = ({ alias, chartOptions, clusterID }: Props) => {
    const { data: debugVars, dataUpdatedAt } = useExperimentalTabletDebugVars(
        { alias, clusterID },
        {
            refetchIntervalInBackground: true,
            refetchInterval: 2500,
        }
    );

    const options: Highcharts.Options = useMemo(() => {
        const series: Highcharts.SeriesOptionsType[] = Object.entries(debugVars?.QPS || {}).map(
            ([seriesName, seriesData]) => {
                const data = ratesToTimeseries(seriesData as number[], 5000, dataUpdatedAt);
                return {
                    data,
                    name: seriesName,
                    type: 'line',
                };
            }
        );

        return mergeOptions([
            {
                series,
                time: {
                    useUTC: false,
                },
                title: {
                    align: 'left',
                    text: 'QPS',
                },
                xAxis: {
                    type: 'datetime',
                },
                yAxis: {
                    // Setting a positive value anchors the y=0 axis to the bottom
                    // rather than the center of the chart when data is empty.
                    softMax: 1,
                    title: {
                        text: undefined,
                    },
                },
            },
            chartOptions || {},
        ]);
    }, [chartOptions, dataUpdatedAt, debugVars?.QPS]);

    return <HighchartsReact highcharts={Highcharts} options={options} />;
};
