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
import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';

import style from './StreamVRepLagSparkline.module.scss';
import { getStream } from '../../util/workflows';
import { fill, takeRight } from 'lodash';

interface Props {
    clusterID: string;
    keyspace: string;
    workflow: string;
    streamID: number | Long;
}

// TODO https://reactjs.org/blog/2018/06/07/you-probably-dont-need-derived-state.html
// https://reactjs.org/docs/hooks-faq.html#how-do-i-implement-getderivedstatefromprops
// https://www.highcharts.com/demo/sparkline

const CACHE_SIZE = 15;

export const StreamVRepLagSparkline = ({ clusterID, keyspace, workflow, streamID }: Props) => {
    const [cache, setCache] = useState<any[]>(() => {
        const INITIAL_CACHE = Array(CACHE_SIZE);
        const now = Date.now();
        for (let i = CACHE_SIZE - 1; i >= 0; i--) {
            INITIAL_CACHE[i] = {
                x: now - i * 2 * 1000,
                y: 0,
            };
        }

        INITIAL_CACHE.reverse();
        return INITIAL_CACHE;
    });

    const { data, ...query } = useWorkflow(
        { clusterID, keyspace, name: workflow },
        {
            refetchIntervalInBackground: true,
            refetchInterval: 1000,
        }
    );

    console.log(data?.workflow?.max_v_replication_lag);
    const stream = getStream(data, streamID);

    useEffect(() => {
        const txnSec = stream?.transaction_timestamp?.seconds;
        const updateSec = stream?.time_updated?.seconds;
        const lagSec = typeof txnSec === 'number' && typeof updateSec === 'number' ? updateSec - txnSec : null;

        const nextCache = takeRight([...cache, { x: query.dataUpdatedAt, y: lagSec }], CACHE_SIZE);
        setCache(nextCache);
    }, [query.dataUpdatedAt, stream]);

    const lastPoint = cache[cache.length - 1];
    console.log(lastPoint?.y);

    const options: Highcharts.Options = useMemo(
        () => ({
            chart: {
                animation: {
                    duration: 350,
                },
                height: 20,
                margin: [2, 50, 2, 0],
                width: 120,
            },
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
                labels: {
                    enabled: false,
                },
                title: {
                    text: null,
                },
                type: 'datetime',
            },
            yAxis: [
                {
                    labels: {
                        enabled: false,
                    },
                    title: {
                        text: null,
                    },
                },
            ],
        }),
        [cache]
    );

    return (
        <div>
            <HighchartsReact highcharts={Highcharts} options={options} />
        </div>
    );
};
