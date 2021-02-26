import { debounce } from 'lodash-es';
import * as React from 'react';
import { useURLQuery } from './useURLQuery';

/**
 * useSyncURLQuery is a hook for synchronizing, or persisting, data
 * with the current URL's query parameters.
 *
 * It is designed to handle data that changes very quickly, like user input
 * into a text field.
 */
export const useSyncURLQuery = (): [string, (s: string) => void] => {
    const { query, pushQuery, replaceQuery } = useURLQuery();
    const urlValue = (query.filter as string) || '';
    const shouldPush = React.useRef<boolean>(true);

    const debouncePush = React.useRef(
        debounce((value: string) => {
            shouldPush.current = true;
        }, 750)
    );

    const setValue = React.useCallback(
        (nextValue: string) => {
            if (shouldPush.current) {
                console.log('pushing', nextValue);
                pushQuery({ filter: nextValue });
            } else {
                replaceQuery({ filter: nextValue });
            }
            shouldPush.current = false;
            debouncePush.current(nextValue);
        },
        [pushQuery, replaceQuery]
    );

    return [urlValue, setValue];
};
