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

import { useWorkflow } from '../../hooks/api';
import { getStream } from '../../util/workflows';
import { mergeOptions } from './chartOptions';
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

const TIME_RANGE = 3 * 60 * 1000; // 3 minutes in milliseconds

/*
 * StreamLagChart makes a best effort at visualizing the VReplication lag for a stream.
 * The way we do this is... not perfectly desirable... and bears some explanation around trade-offs. :)
 * Vitess doesn't (currently) return timeseries data for stream VReplication lag. What we do have,
 * though, are two timestamps:
 *
 *  - stream.time_updated: the timestamp of the last updated applied by the stream
 *    to the target, from the source primary.
 *
 *  - stream.transaction_timestamp: the timestamp of the last transaction replicated
 *    the stream to the target, from the source primary.
 *
 * The VReplication lag of a stream *at a single point in time* is thus difference between
 * stream.time_updated and stream.transaction_timestamp.
 *
 * Problem #1: Caching
 * To go from "lag at a single point in time" to "lag over the last n seconds", we cache
 * these calculations on the client. This is undesirable not only because caching is hard,
 * but client-side caching is ephemeral. Namely: lag data does not persist between page refresh,
 * nor across browser tabs, nor (since we "cache" in component state) across component re-mounts,
 * even for the same stream.
 *
 * One potential way to mitigate this is to maintain a cache by streamKey at the file-level,
 * outside of component state. Because caching is hard, we want to minimize the amount of
 * weird tricks we deploy, and so this is saved as a future "enhancement", since an
 * arguably better solution is noted below.
 *
 * Problem #2: Inconsistency
 * This leads to a second, somewhat confusing complication: stream.time_updated and stream.transaction_timestamp
 * change very quickly. This means that different instances of the StreamLagChart (such as two browser tabs)
 * will use unsynchronized useWorkflow queries, each having different values and therefore
 * the timeseries will show different shapes.
 *
 * A Solution...?
 * A more desirable approach is for Vitess itself to track vreplication lag for each stream
 * with a rates gauge (as we do for tablet QPS, etc.). Then we wouldn't have to cache at all.
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

        // For the x-axis, use the timestamp of the query rather than stream.time_updated.
        // This results in regularly spaced data points that are synchronized
        // with other timeseries derived from the /api/workflows response.
        const timestamp = query.dataUpdatedAt;

        // Stream replication lag is calculated as the difference between
        // when the stream was updated and the timestamp of the corresponding
        // transaction replicated from the primary.
        const lag = timeUpdated - txnTimestamp;

        setLagData((prevLagData) => {
            return [...prevLagData, { x: timestamp, y: lag }];
        });
    }, [query.dataUpdatedAt, setLagData, stream, streamKey]);

    const options: Highcharts.Options = useMemo(() => {
        const lastPoint = lagData[lagData.length - 1];
        const lastTs = lastPoint ? lastPoint.x : Date.now();
        const firstTs = lastTs - TIME_RANGE;

        const seriesData = lagData.filter((d) => d.x >= firstTs);

        return mergeOptions({
            legend: {
                enabled: false,
            },
            series: [
                {
                    data: seriesData,
                    name: 'Lag',
                    type: 'line',
                },
            ],
            tooltip: {
                valueSuffix: ' seconds',
            },
            xAxis: {
                // Set `softMin` to ensure the chart consistently spans the full TIME_RANGE
                // even when the data does not, such as when the view is first loaded and
                // the cache is empty.
                softMin: firstTs,
            },
            yAxis: {
                labels: {
                    format: '{value} s',
                },
            },
        });
    }, [lagData]);

    return <Timeseries isLoading={query.isLoading} options={options} />;
};
