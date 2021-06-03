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

/**
 * TabletDebugVars is a best-effort typing of the /debug/vars tablet endpoint.
 * Only fields read by VTAdmin are defined here.
 *
 * A good future enhancement is a proto-typed gRPC endpoint in vtadmin.proto,
 * from which we can generate TypeScript typings vs. having to duplicate them here.
 * This would also offer us actual runtime type safety by way of protobufjs's
 * generated validate() functions. For now, everything in here is optional (hence
 * the Partial<>) and not guaranteed to be defined in every Vitess deployment.
 */
export type TabletDebugVars = Partial<{
    // Build vars
    // See https://github.com/vitessio/vitess/blob/main/go/vt/servenv/buildinfo.go
    BuildGitBranch: string;
    BuildGitRev: string;
    BuildHost: string;
    BuildInformation: { [k: string]: number | string };
    BuildNumber: string;
    BuildTimestamp: string;
    BuildUser: string;

    QPS: { [k: string]: number[] };

    // See https://github.com/vitessio/vitess/blob/main/go/vt/vttablet/tabletmanager/vreplication/stats.go
    VReplicationQPS: { [k: string]: number[] };
}>;

export interface TimeseriesPoint {
    x: number;
    y: number;
}

export type TimeseriesMap = { [seriesName: string]: TimeseriesPoint[] };

export const getQPSTimeseries = (d: TabletDebugVars | null | undefined, endAt?: number): TimeseriesMap =>
    formatTimeseriesMap(d?.QPS || {}, endAt);

export const getVReplicationQPSTimeseries = (d: TabletDebugVars | null | undefined, endAt?: number): TimeseriesMap =>
    formatTimeseriesMap(d?.VReplicationQPS || {}, endAt);

export const RATES_INTERVAL = 5 * 1000; // 5 seconds
export const RATES_MAX_SPAN = 15 * 60 * 1000; // 15 minutes
export const SERIES_LENGTH = RATES_MAX_SPAN / RATES_INTERVAL;

/**
 * formatTimeseriesMap formats an array of numbers from a Rates stats counter as
 * an array of TimeseriesPoints, spanning a 15 minute time period with data
 * points at 5 second intervals.
 *
 * For Rates stats, see https://github.com/vitessio/vitess/blob/main/go/stats/rates.go
 *
 * @param rates - An array of numbers, inferred as data points at 5 minute intervals
 * for a maximum span of 15 minutes.
 *
 * @param endAt - Optional. The timestamp for the last (most recent) data point in the series.
 * The `dataUpdatedAt` property of a query is recommended. Defaults to Date.now() if unspecified.
 */
export const formatTimeseriesMap = (rates: { [k: string]: number[] }, endAt?: number): TimeseriesMap => {
    // Rates stats are (unfortunately) not returned with timestamps, so we infer them here.
    // This behaviour matches that of the vtctld2 UI:
    // https://github.com/vitessio/vitess/blob/main/go/vt/vttablet/tabletserver/status.go#L178
    const _endAt = typeof endAt === 'number' ? endAt : Date.now();

    return Object.entries(rates).reduce((acc, [seriesName, seriesRates]) => {
        const tsData = [];

        // Index into the input array, starting with the last value and working backwards.
        let rdx = seriesRates.length - 1;

        // Keep track of the time offset.
        let tdx = 0;

        for (let idx = SERIES_LENGTH - 1; idx >= 0; idx--) {
            const timestamp = _endAt - tdx * RATES_INTERVAL;
            tdx++;

            const value = rdx >= 0 ? seriesRates[rdx--] : 0;

            tsData[idx] = {
                x: timestamp,
                y: value,
            };
        }

        acc[seriesName] = tsData;
        return acc;
    }, {} as TimeseriesMap);
};
