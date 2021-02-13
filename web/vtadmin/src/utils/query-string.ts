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
import { merge } from 'lodash-es';
import qs from 'query-string';

export interface ParsedQuery<T = string> {
    [key: string]: T | T[] | null | undefined;
}

const DEFAULT_PARSE_OPTIONS: qs.ParseOptions = {
    arrayFormat: 'none',
    parseBooleans: true,
    parseNumbers: true,
};

export const parse = (search: string, opts: qs.ParseOptions = {}) =>
    qs.parse(search, merge({}, DEFAULT_PARSE_OPTIONS, opts));

const DEFAULT_STRINGIFY_OPTIONS: qs.StringifyOptions = {
    arrayFormat: 'none',
};

export const stringify = (query: ParsedQuery<string | number | boolean>, opts: qs.StringifyOptions = {}) =>
    qs.stringify(query, merge({}, DEFAULT_STRINGIFY_OPTIONS, opts));
