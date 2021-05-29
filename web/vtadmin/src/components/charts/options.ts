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
        styledMode: true,
    },
    credits: {
        enabled: false,
    },
    plotOptions: {
        series: {
            animation: false,
        },
    },
};

export const mergeOptions = (opts: Options[]): Options => {
    return merge({}, DEFAULT_OPTIONS, ...opts);
};
