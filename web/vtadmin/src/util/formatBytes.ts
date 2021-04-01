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

const BASE = 1024;
const DEFAULT_PRECISION = 2;
const UNITS = ['B', 'KiB', 'MiB', 'GiB', 'TiB', 'PiB', 'EiB', 'ZiB', 'YiB'];

export interface PrettyBytesOpts {
    precision?: number;
    units?: string;
}

/**
 * prettyBytes converts bytes to a human-readable string.
 */
export const prettyBytes = (input: number | Long | null | undefined, opts: PrettyBytesOpts = {}): string | null => {
    if (input === null || typeof input === 'undefined') return null;

    const num = Number(input);
    const precision = opts.precision || DEFAULT_PRECISION;

    const i = opts.units ? UNITS.indexOf(opts.units) : Math.floor(Math.log(num) / Math.log(BASE));
    if (i < 0) return null;

    return parseFloat((num / Math.pow(BASE, i)).toFixed(precision)).toLocaleString() + ' ' + UNITS[i];
};
