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
import { useCallback, useMemo } from 'react';
import { useHistory, useLocation } from 'react-router-dom';
import { ArrayFormatType, parse, ParsedQuery, stringify } from '../utils/query-string';

export interface URLQueryOptions {
    arrayFormat?: ArrayFormatType;
    parseBooleans?: boolean;
    parseNumbers?: boolean;
}

/**
 * useURLQuery is a hook for getting and setting query parameters from the current URL,
 * where "query parameters" are those appearing after the "?":
 *
 *      https://test.com/some/route?foo=bar&count=123&list=one&list=two&list=3
 *                                  ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
 *
 * The query parameters from the above URL would be parsed as:
 *
 *      { foo: "bar", count: 123, list: ["one", "two", "three"] }
 *
 * For lots more usage examples, see the useURLQuery unit tests.
 */
export const useURLQuery = (
    opts: URLQueryOptions = {}
): {
    /** query is the current URL query parameters, parsed into an object. */
    query: ParsedQuery<string | number | boolean>;

    /**
     * pushQuery stringifies and pushes `nextQuery` onto the history stack,
     * merging `nextQuery` with the current query parameters.
     *
     * This does not affect location.pathname: if your current path
     * is "/test?greeting=hello", then calling `pushQuery({ greeting: "hi" })`
     * will push "/test?greeting=hi". If you *do* want to update the pathname,
     * then use useHistory()'s history.push directly.
     */
    pushQuery: (nextQuery: ParsedQuery<string | number | boolean>) => void;

    /**
     * replaceQuery stringifies and pushes `nextQuery` onto the history stack,
     * merging `nextQuery` with the current query parameters.
     *
     * This does not affect location.pathname: if your current path
     * is "/test?greeting=hello", then calling `replaceQuery({ greeting: "hi" })`
     * will replace "/test?greeting=hi". If you *do* want to update the pathname,
     * then use useHistory()'s history.push directly.
     */
    replaceQuery: (nextQuery: ParsedQuery<string | number | boolean>) => void;
} => {
    const history = useHistory();
    const location = useLocation();

    // Hmm: https://github.com/ReactTraining/react-router/blob/master/packages/react-router/docs/api/history.md#history-is-mutable
    const search = location.search || history.location.search;

    // Destructure `opts` for more granular useMemo and useCallback dependencies.
    const { arrayFormat, parseBooleans, parseNumbers } = opts;

    // Parse the URL search string into a mapping from URL parameter key to value.
    const query = useMemo(
        () =>
            parse(search, {
                arrayFormat,
                parseBooleans,
                parseNumbers,
            }),
        [search, arrayFormat, parseBooleans, parseNumbers]
    );

    const pushQuery = useCallback(
        (nextQuery: ParsedQuery<string | number | boolean>) => {
            const nextSearch = stringify({ ...query, ...nextQuery }, { arrayFormat });
            return history.push({ search: `?${nextSearch}` });
        },
        [arrayFormat, history, query]
    );

    const replaceQuery = useCallback(
        (nextQuery: ParsedQuery<string | number | boolean>) => {
            const nextSearch = stringify({ ...query, ...nextQuery }, { arrayFormat });
            return history.replace({ search: `?${nextSearch}` });
        },
        [arrayFormat, history, query]
    );

    return { query, pushQuery, replaceQuery };
};
