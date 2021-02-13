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
import qs from 'query-string';
import { useLocation } from 'react-router-dom';

export interface ParsedQuery<T = string> {
    [key: string]: T | T[] | null;
}

// useURLQuery is a hook for getting and setting query parameters from the current URL,
// where "query parameters" are those appearing after the "?":
//
//      https://test.com/some/route?foo=bar&count=123
//                                  ^^^^^^^^^^^^^^^^^
//
// The query parameters from the above URL would be parsed as:
//
//      { foo: "bar", count: 123 }
//
export const useURLQuery = (): {
    query: ParsedQuery<string | number | boolean>;
} => {
    const { search } = useLocation();

    // For full options, see: https://github.com/sindresorhus/query-string
    const query = qs.parse(search, {
        // Parse arrays with elements using duplicate keys
        // 'foo=1&foo=2&foo=3' => { foo: [1, 2, 3] }
        arrayFormat: 'none',
        parseBooleans: true,
        parseNumbers: true,
    });

    return { query };
};
