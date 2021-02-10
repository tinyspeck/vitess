import { useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { useURLParams } from './useURLParams';

interface PaginationParams {
    page: number;
    rowsPerPage: number;
}

type SetPaginationParamsFn = (p: PaginationParams) => void;

const DEFAULT_FIRST_PAGE = 1;
const DEFAULT_ROWS_PER_PAGE = 50;

export const usePaginationParams = (defaults: Partial<PaginationParams>): [PaginationParams, SetPaginationParamsFn] => {
    const params: any = useURLParams();

    const paginationParams = {
        page: params.page || defaults.page || DEFAULT_FIRST_PAGE,
        rowsPerPage: params.rowsPerPage || defaults.rowsPerPage || DEFAULT_ROWS_PER_PAGE,
    };

    const setPaginationParams = useCallback((params: PaginationParams) => {}, []);
    return [paginationParams, setPaginationParams];
};
