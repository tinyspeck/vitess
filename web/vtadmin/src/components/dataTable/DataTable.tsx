import * as React from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import qs from 'query-string';
import cx from 'classnames';

import { usePaginationParams } from '../../hooks/usePaginationParams';
import style from './DataTable.module.scss';

interface Props<T> {
    columns: string[];
    data: T[];
    pageNavLength?: number;
    renderRows: (rows: T[]) => JSX.Element[];
    rowsPerPage?: number;
}

/**
 * What DataTable does:
 * 	- Pagination
 *
 * What DataTable does NOT do:
 * 	- Sorting
 * 	- Filtering
 *
 * Useful accessibility references:
 * 	- https://www.digitala11y.com/aria-rowcountproperties/
 * 	- https://www.a11ymatters.com/pattern/pagination/
 * 	- https://a11y-style-guide.com/style-guide/section-navigation.html
 */
export const DataTable = <T extends object>({ columns, data, pageNavLength, renderRows, rowsPerPage }: Props<T>) => {
    const location = useLocation();
    const { pathname } = location;

    const params = useParams();

    const [pagination, setPagination] = usePaginationParams({ rowsPerPage });

    const startIndex = (pagination.page - 1) * pagination.rowsPerPage;
    const endIndex = startIndex + pagination.rowsPerPage;
    const visibleData = data.slice(startIndex, endIndex);

    const lastPage = Math.ceil(data.length / pagination.rowsPerPage);

    const pageNumbers = getVisiblePageNumbers(lastPage, pagination.page, pageNavLength);

    return (
        <div>
            <table aria-rowcount={data.length}>
                <thead>
                    <tr>
                        {columns.map((c, i) => (
                            <th key={i}>{c}</th>
                        ))}
                    </tr>
                </thead>
                <tbody>{renderRows(visibleData)}</tbody>
            </table>
            <nav className={style.paginationContainer} role="navigation" aria-label="pagination navigation">
                <p>
                    Showing {startIndex + 1} - {endIndex} of {data.length}
                </p>
                {lastPage > 1 && (
                    <div className={style.pageNumbers}>
                        {pageNumbers.map((page: number, idx: number) =>
                            page === 0 ? (
                                <div className={style.pageLinkPlaceholder} key={`placeholder=${idx}`} />
                            ) : (
                                <Link
                                    className={cx(style.pageLink, { [style.activePageLink]: page === pagination.page })}
                                    key={`page-${page}-${idx}`}
                                    to={{ pathname, search: qs.stringify({ ...params, page }) }}
                                >
                                    {page}
                                </Link>
                            )
                        )}
                    </div>
                )}
            </nav>
        </div>
    );
};

// The most important thing to note is that a value of `0` implies an elided button.
// This is entirely lifted from StackOverflow:
// https://stackoverflow.com/questions/46382109/limit-the-number-of-visible-pages-in-pagination/46385144
// It... could use improvement! Later!
const getVisiblePageNumbers = (totalPages: number, page: number, maxLength: number = 9): number[] => {
    const sideWidth = 1;
    const leftWidth = (maxLength - sideWidth * 2 - 3) >> 1;
    const rightWidth = (maxLength - sideWidth * 2 - 2) >> 1;

    if (totalPages <= maxLength) {
        // no breaks in list
        return range(1, totalPages);
    }

    if (page <= maxLength - sideWidth - 1 - rightWidth) {
        // no break on left of page
        return range(1, maxLength - sideWidth - 1).concat(0, range(totalPages - sideWidth + 1, totalPages));
    }

    if (page >= totalPages - sideWidth - 1 - rightWidth) {
        // no break on right of page
        return range(1, sideWidth).concat(0, range(totalPages - sideWidth - 1 - rightWidth - leftWidth, totalPages));
    }

    // Breaks on both sides
    return range(1, sideWidth).concat(
        0,
        range(page - leftWidth, page + rightWidth),
        0,
        range(totalPages - sideWidth + 1, totalPages)
    );
};

const range = (start: number, end: number): number[] => {
    if (isNaN(start) || isNaN(end)) return [];
    return Array.from(Array(end - start + 1), (_, i) => i + start);
};
