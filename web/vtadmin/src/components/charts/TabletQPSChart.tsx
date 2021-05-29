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
            refetchInterval: 1000,
        }
    );

    const options: Highcharts.Options = useMemo(() => {
        const series: Highcharts.SeriesOptionsType[] = Object.entries(debugVars?.QPS || {}).map(
            ([seriesName, seriesData]) => {
                const sd = seriesData as number[];
                const data = sd.map((d, di) => {
                    // TODO Create data points, starting with the most recent timestamp.
                    // (On the graph this means going from right to left.)
                    // Time span: 15 minutes in 5 second intervals.
                    return {
                        x: dataUpdatedAt - (sd.length - di) * 5 * 1000,
                        y: d,
                    };
                });

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
                xAxis: {
                    type: 'datetime',
                },
            },
            chartOptions || {},
        ]);
    }, [chartOptions, dataUpdatedAt, debugVars?.QPS]);

    return <HighchartsReact highcharts={Highcharts} options={options} />;
};
