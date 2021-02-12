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
import { debounce, isEqual } from 'lodash-es';
import qs from 'query-string';
import { useEffect, useCallback, useRef } from 'react';
import { useHistory, useLocation } from 'react-router-dom';

/**
 * useURLQuery is a hook for parsing query parameters from the current URL
 * into a map, where "query parameters" are those appearing after the "?".
 *
 * So, given a URL like: https://test.com/some/route?foo=bar&count=123
 *                                                   ^^^^^^^^^^^^^^^^^
 * ... useURLQuery() would return `{ foo: "bar", count: 123 }`
 */
// Simplest use case `push` + `replace`, which should hopefully
// share exact same interface as history.push + replace
//
//  - Take an object of query parameters
//  - Stringify it to ? string
//  - Push to history
//
// More complicated! We can have a `debouncedPush`:
//
//  - Call it as many times as you want and it will always
//  replace instead of push so as not to pollute history
//
//  - After `debounceMs` time has passed, it will persist
//  it to history with a push. (NOTE: check about re-rendering.)
//
//  - Can also provide a "flush" function to flush on blur, etc. maybe?
//  Maybe this isn't necessary though?
//
// Notes:
//  * Also clearing should happen automatically.
//  * Support multiple parameters: replace AND extend
//  * Default parameters?
//  * Rendering performance???
//  * Typed query parameters???????
//  * Debounce by value so you don't push the same value onto history
//  * Cancel debounce function invocations on cleanup.
//  * encoding URL components
//  * omit empty values
export const useURLQuery = <T>(): {
    // Query string parameters parsed into an object.
    query: qs.ParsedQuery<string | number | boolean>;

    pushQuery: (q: Partial<T>) => void;
    replaceQuery: (q: Partial<T>) => void;
    syncQuery: (q: Partial<T>) => void;
} => {
    const shouldReplace = useRef<boolean>(false);
    // const lastPersistedValue: any = useRef(query);
    const history = useHistory();
    const { search } = useLocation();

    const query = qs.parse(search, {
        // Parse arrays with elements using duplicate keys
        // 'foo=1&foo=2&foo=3' => { foo: [1, 2, 3] }
        arrayFormat: 'none',
        parseBooleans: true,
        // parseNumbers: true,
    });

    const pushQuery = useCallback(
        (q: any) => {
            const search = qs.stringify(q);
            history.push({ ...history.location, search });
        },
        [history]
    );

    const replaceQuery = useCallback(
        (q: any) => {
            const search = qs.stringify(q);
            history.replace({ ...history.location, search });
        },
        [history]
    );

    const debouncedSync = useRef(
        debounce(
            (q: any) => {
                shouldReplace.current = false;
            },
            1000,
            {
                // leading: true,
            }
        )
    );

    const syncQuery = useCallback(
        (q: any) => {
            // TODO check and make sure current persisted value is not
            // the same as what we are persisting here.
            //
            // TODO if new query string is empty string, make sure
            // entire last value (before it's cleared) is pushed/replaced.
            if (shouldReplace.current) {
                replaceQuery(q);
            } else {
                pushQuery(q);
                shouldReplace.current = true;
            }
            debouncedSync.current(q);
        },
        [pushQuery, replaceQuery]
    );

    // For full options, see: https://github.com/sindresorhus/query-string
    return { query, pushQuery, replaceQuery, syncQuery };
};
