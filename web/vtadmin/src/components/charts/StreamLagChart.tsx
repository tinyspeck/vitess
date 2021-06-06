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

import { take } from 'lodash';
import { takeRight } from 'lodash-es';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useWorkflow } from '../../hooks/api';
import { getStream } from '../../util/workflows';
import { Timeseries } from './Timeseries';

interface Props {
    clusterID: string;
    keyspace: string;
    streamKey: string;
    workflowName: string;
}

interface DataPoint {
    x: number;
    y: number;
}

/**
 * StreamLagChart is a prototype that makes a best effort at visualizing
 * the VReplication lag for a stream.
 */
export const StreamLagChart = ({ clusterID, keyspace, streamKey, workflowName }: Props) => {
    const [lagData, setLagData] = useState<DataPoint[]>([]);

    const { data: workflow, ...query } = useWorkflow(
        {
            clusterID,
            keyspace,
            name: workflowName,
        },
        { refetchInterval: 1000, refetchIntervalInBackground: true }
    );

    const stream = getStream(workflow, streamKey);

    useEffect(() => {
        const timeUpdated = stream?.time_updated?.seconds;
        const txnTimestamp = stream?.transaction_timestamp?.seconds;

        if (typeof timeUpdated !== 'number' || typeof txnTimestamp !== 'number') {
            return;
        }

        const lag = timeUpdated - txnTimestamp;
        setLagData((prevLagData) => [...prevLagData, { x: query.dataUpdatedAt, y: lag }]);
    }, [query.dataUpdatedAt, setLagData, stream]);

    const options: Highcharts.Options = useMemo(() => {
        const lastPoint = lagData[lagData.length - 1];
        const lastTs = lastPoint ? lastPoint.x : Date.now();
        const firstTs = lastTs - 180 * 1000;
        const seriesData = lagData.filter((d) => d.x >= firstTs);

        return {
            legend: {
                enabled: false,
            },
            series: [
                {
                    data: seriesData,
                    type: 'line',
                },
            ],
            xAxis: {
                softMin: firstTs,
            },
            yAxis: {
                labels: {
                    format: '{value} s',
                },
            },
        };
    }, [lagData]);

    return <Timeseries options={options} />;
};
