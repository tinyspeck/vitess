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
import { takeRight } from 'lodash';
import React, { useState } from 'react';

import { useWorkflow } from '../../hooks/api';
import { getStream, getStreamVRepLag } from '../../util/workflows';

interface Props {
    clusterID: string;
    keyspace: string;
    streamKey: string;
    workflowName: string;
}

interface CacheValue {
    lag: number | null;
    txnAt: number;
    updatedAt: number;
}

const CACHE_SIZE = 30;

export const StreamVRepLagChart = ({ clusterID, keyspace, streamKey, workflowName }: Props) => {
    const [softMin, setSoftMin] = useState(Date.now() - CACHE_SIZE * 1000);
    const [cache, setCache] = useState<CacheValue[]>([]);

    const { data: workflow, ...query } = useWorkflow(
        {
            clusterID: clusterID,
            keyspace: keyspace,
            name: workflowName,
        },
        {
            refetchIntervalInBackground: true,
            refetchInterval: 1000,
        }
    );

    const stream = getStream(workflow, streamKey);
    const currentLag = getStreamVRepLag(stream);
    const updatedAt = stream?.time_updated?.seconds;
    const txnAt = stream?.transaction_timestamp?.seconds;

    const lastPoint = cache[cache.length - 1];

    // This is equivalent to using getDerivedStateFromProps, if this were a class component.
    // See https://reactjs.org/docs/hooks-faq.html#how-do-i-implement-getderivedstatefromprops
    if (typeof updatedAt === 'number' && typeof txnAt === 'number' && lastPoint?.updatedAt !== updatedAt) {
        const nextCache = [...cache, { updatedAt, txnAt, lag: currentLag }];
        setCache(takeRight(nextCache, CACHE_SIZE));
        setSoftMin(Date.now() - CACHE_SIZE * 1000);
    }

    const data = cache.map((d) => ({
        x: d.updatedAt * 1000,
        y: d.lag,
        metadata: d,
    }));

    const options: Highcharts.Options = {
        chart: {
            animation: {
                duration: 250,
            },
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
                marker: {
                    enabled: false,
                    states: {
                        hover: {
                            radius: 4,
                        },
                    },
                },
                states: {
                    hover: {
                        lineWidth: 1,
                    },
                },
            },
        },
        series: [
            {
                color: '#3d5afe', // TODO add javascript const for this
                data,
                fillOpacity: 0.2,
                type: 'area',
            },
        ],
        title: {
            align: 'left',
            text: 'VReplication Lag',
        },
        tooltip: {
            formatter: function () {
                console.log(this);
                return `
					<b>VReplication Lag:</b> ${this.y}<br/>
					<br/>
					<b>Updated at:</b>  ${(this.point as any).metadata.updatedAt}<br/>
					<b>Transaction ts:</b> ${(this.point as any).metadata.txnAt}
				`;
            },
            outside: true,
        },
        xAxis: {
            crosshair: true,
            softMin,
            tickInterval: 5000,
            type: 'datetime',
        },
        yAxis: {
            min: 0,
            title: {
                text: 'Seconds',
            },
        },
    };

    return (
        <div>
            <HighchartsReact highcharts={Highcharts} options={options} />
            {/* <table>
                <thead>
                    <tr>
                        <th>Updated at</th>
                        <th>Transaction ts</th>
                        <th>Replication lag</th>
                    </tr>
                </thead>
                <tbody>
                    {[...cache].reverse().map((d, i) => (
                        <tr key={d.updatedAt}>
                            <td>
                                <div>{new Date(d.updatedAt * 1000).toLocaleTimeString()}</div>
                                <div className="font-size-small text-color-secondary">{d.updatedAt}</div>
                            </td>
                            <td>
                                <div>{new Date(d.txnAt * 1000).toLocaleTimeString()}</div>
                                <div className="font-size-small text-color-secondary">{d.txnAt}</div>
                            </td>
                            <td>{d.lag}</td>
                        </tr>
                    ))}
                </tbody>
            </table> */}
        </div>
    );
};
