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

export interface Point {
    x: number;
    y: number; // milliseconds
}

/**
 * Formats an array of numbers as timeseries data.
 *
 * @param rates - An array of y-values
 * @param interval - The interval between each data point, in milliseconds.
 * @param offset - The timestamp for the most recent (last) value in `rates`. Defaults to Date.now().
 * @returns timeseries data
 */
export const ratesToTimeseries = (rates: number[], interval: number, offset?: number): Point[] => {
    const _offset = typeof offset === 'number' ? offset : Date.now();

    const padCount = 180 - rates.length;
    const padding = [];
    for (let i = 0; i < padCount; i++) {
        padding[i] = 0;
    }

    const _rates = [...padding, ...rates];

    return _rates.map((d, di) => {
        // TODO Create data points, starting with the most recent timestamp.
        // (On the graph this means going from right to left.)
        // Time span: 15 minutes in 5 second intervals.
        return {
            x: _offset - (((_rates.length - di) * 60) / 5) * 1000,
            y: d,
        };
    });
};
