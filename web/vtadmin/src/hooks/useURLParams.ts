import qs from 'query-string';
import { useLocation } from 'react-router-dom';

export const useURLParams = <T extends object>(): T => {
    const { search } = useLocation();
    return qs.parse(search, {
        arrayFormat: 'none',
        parseBooleans: true,
        parseNumbers: true,
    }) as T;
};
