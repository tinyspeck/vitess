import { useWorkflow } from '../../hooks/api';

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
import { useEffect, useMemo, useState } from 'react';
import Highcharts, { merge } from 'highcharts';
import HighchartsReact from 'highcharts-react-official';

import style from './StreamVRepLagSparkline.module.scss';
import { getStream } from '../../util/workflows';
import { fill, takeRight } from 'lodash';

interface Props {
    clusterID: string;
    keyspace: string;
    sparkline?: true;
    streamKey: string;
    workflow: string;
}

// TODO https://reactjs.org/blog/2018/06/07/you-probably-dont-need-derived-state.html
// https://reactjs.org/docs/hooks-faq.html#how-do-i-implement-getderivedstatefromprops
// https://www.highcharts.com/demo/sparkline

const CACHE_SIZE = 15;

export const StreamVRepLagSparkline = ({ clusterID, keyspace, sparkline, streamKey, workflow }: Props) => {
    const [cache, setCache] = useState<any[]>([]);

    const { data, ...query } = useWorkflow(
        { clusterID, keyspace, name: workflow },
        {
            refetchIntervalInBackground: true,
            refetchInterval: 1000,
        }
    );

    const stream = getStream(data, streamKey);

    useEffect(() => {
        const txnSec = stream?.transaction_timestamp?.seconds;
        const updateSec = stream?.time_updated?.seconds;
        if (typeof updateSec !== 'number' || typeof txnSec !== 'number') {
            return;
        }

        const lagSec = typeof txnSec === 'number' && typeof updateSec === 'number' ? updateSec - txnSec : null;
        console.log(stream?.shard, txnSec, updateSec, lagSec, stream);

        const nextCache = takeRight([...cache, { x: updateSec * 1000, y: lagSec }], CACHE_SIZE);
        setCache(nextCache);
    }, [query.dataUpdatedAt, stream]);

    console.table(cache);

    const options: Highcharts.Options = useMemo(() => {
        const DEFAULT_OPTS: Highcharts.Options = {};

        const SPARKLINE_OPTS: Highcharts.Options = {
            chart: {
                height: 20,
                margin: [2, 0, 2, 0],
                width: 120,
            },
            xAxis: {
                labels: {
                    enabled: false,
                },
                title: {
                    text: null,
                },
            },
            yAxis: {
                gridLineWidth: 0,
                labels: {
                    enabled: false,
                },
                title: {
                    text: null,
                },
            },
        };

        const _opts: Highcharts.Options = {
            credits: {
                enabled: false,
            },
            legend: {
                enabled: false,
            },
            plotOptions: {
                series: {
                    animation: false,
                    lineWidth: 1,
                    shadow: false,
                    states: {
                        hover: {
                            lineWidth: 1,
                        },
                    },
                    marker: {
                        enabled: false,
                        states: {
                            hover: {
                                radius: 2,
                            },
                        },
                    },
                },
            },
            series: [
                {
                    color: '#3d5afe',
                    data: cache,
                    fillOpacity: 0.25,
                    type: 'area',
                },
            ],
            title: {
                text: '',
            },
            tooltip: {
                outside: true,
            },
            xAxis: {
                softMin: Date.now() - 15 * 1000,
                tickInterval: 1000,
                type: 'datetime',
            },
            yAxis: {
                min: 0,
                title: {
                    text: 'Seconds',
                },
            },
        };
        const opts: Highcharts.Options = merge({}, { ...DEFAULT_OPTS }, _opts);

        return sparkline ? merge(opts, SPARKLINE_OPTS) : opts;
    }, [cache, sparkline]);

    return (
        <div>
            <HighchartsReact highcharts={Highcharts} options={options} />
            <pre>{JSON.stringify(cache, null, 2)}</pre>
        </div>
    );
};
