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

const CACHE_SIZE = 15;

export const StreamVRepLagChart = ({ clusterID, keyspace, streamKey, workflowName }: Props) => {
    const [cache, setCache] = useState<any[]>([]);
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
    const currentUpdateSec = stream?.time_updated?.seconds;

    const lastPoint = cache[cache.length - 1];
    if (lastPoint?.updatedAt !== currentUpdateSec) {
        const nextCache = [
            ...cache,
            { updatedAt: currentUpdateSec, lastTxnAt: stream?.transaction_timestamp?.seconds, lag: currentLag },
        ];

        setCache(takeRight(nextCache, CACHE_SIZE));
    }

    const data = cache.map((d) => ({
        x: d.updatedAt,
        y: d.lag,
    }));

    const options = {
        series: [
            {
                data,
                type: 'area',
            },
        ],
        title: {
            text: 'My chart',
        },
        xAxis: {
            softMin: Date.now() - CACHE_SIZE * 1000,
            tickInterval: 1000,
            type: 'datetime',
        },
    };

    return (
        <div>
            <HighchartsReact highcharts={Highcharts} options={options} />
            <table>
                <thead>
                    <tr>
                        <th>Updated at</th>
                        <th>Transaction ts</th>
                        <th>Replication lag</th>
                    </tr>
                </thead>
                <tbody>
                    {[...cache].reverse().map((d, i) => (
                        <tr key={d.x}>
                            <td>
                                <div>{new Date(d.updatedAt * 1000).toLocaleTimeString()}</div>
                                <div className="font-size-small text-color-secondary">{d.updatedAt}</div>
                            </td>
                            <td>
                                <div>{new Date(d.lastTxnAt * 1000).toLocaleTimeString()}</div>
                                <div className="font-size-small text-color-secondary">{d.lastTxnAt}</div>
                            </td>
                            <td>{d.lag}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};
