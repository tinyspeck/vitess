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
import { merge, Options } from 'highcharts';

/**
 * Default Highcharts.Options for all charts.
 */
export const DEFAULT_OPTIONS: Options = {
    chart: {
        animation: false,
        // Default chart styles are in ./components/charts/charts.scss
        // and imported at boot time in index.tsx.
        // styledMode: true,
    },
    colors: [
        '#0000ff',
        '#001cf1',
        '#0039e3',
        '#0055d5',
        '#0071c7',
        '#008eb8',
        '#00aaaa',
        '#00c69c',
        '#00e38e',
        '#00ff80',
    ],
    credits: {
        enabled: false,
    },
    plotOptions: {
        area: {
            fillOpacity: 0.1,
            lineWidth: 1,
        },
        areaspline: {
            fillOpacity: 0.1,
            lineWidth: 1,
        },
        series: {
            animation: false,
            lineWidth: 1,
        },
    },
};

export const SPARKLINE_OPTIONS: Options = {
    chart: {
        borderWidth: 0,
        height: 20,
        margin: [0, 2, 0, 2],
        style: {
            overflow: 'visible',
        },
        width: 120,
    },
    legend: {
        enabled: false,
    },
    title: {
        text: undefined,
    },
    tooltip: {
        hideDelay: 0,
        outside: true,
        shared: true,
    },
    xAxis: {
        crosshair: true,
    },
};

export const mergeOptions = (opts: Options[]): Options => {
    return merge({}, DEFAULT_OPTIONS, ...opts);
};
