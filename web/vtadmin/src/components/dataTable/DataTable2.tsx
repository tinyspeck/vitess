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

import { useEffect } from 'react';
import {
    Column,
    TableState,
    useExpanded,
    useGlobalFilter,
    useGroupBy,
    usePagination,
    useSortBy,
    useTable,
} from 'react-table';
import { DataHeader } from './DataHeader';
import { PaginationNav } from './PaginationNav';

interface Props<T extends object> {
    columns: Column<T>[];
    data: T[];
    filter?: string | null | undefined;
    initialState?: Partial<TableState<T>>;
}

export const DataTable2 = <T extends object>({ columns, data, filter, initialState }: Props<T>) => {
    const { setGlobalFilter, ...table } = useTable(
        {
            // See https://react-table.tanstack.com/docs/faq#how-do-i-stop-my-table-state-from-automatically-resetting-when-my-data-changes
            // autoResetExpanded: false,
            // autoResetGroupBy: false,
            autoResetGlobalFilter: false,
            autoResetPage: false,
            autoResetSortBy: false,
            columns,
            data,
            initialState: {
                pageSize: 10,
                ...initialState,
            },
            manualFilters: true,
            manualGlobalFilter: true,
        },
        // Order of plugins matters
        // useGroupBy,
        useGlobalFilter,
        useSortBy,
        usePagination
        // useExpanded
    );

    useEffect(() => {
        // See https://github.com/tannerlinsley/react-table/discussions/2181
        setGlobalFilter(filter);
    }, [filter, setGlobalFilter]);

    console.log(table);

    return (
        <div>
            <table {...table.getTableProps()}>
                <thead>
                    {table.headerGroups.map((headerGroup) => (
                        <tr {...headerGroup.getHeaderGroupProps()}>
                            {headerGroup.headers.map((column) => (
                                <DataHeader column={column} />
                            ))}
                        </tr>
                    ))}
                </thead>
                <tbody {...table.getTableBodyProps()}>
                    {table.page.map((row) => {
                        table.prepareRow(row);
                        return (
                            <tr {...row.getRowProps()}>
                                {row.cells.map((cell) => (
                                    <td {...cell.getCellProps()}>{cell.render('Cell')}</td>
                                ))}
                            </tr>
                        );
                    })}
                </tbody>
            </table>

            <p className="text-color-secondary">
                Page {table.state.pageIndex} of {table.pageCount}
            </p>

            {/* <PaginationNav currentPage={page} formatLink={formatPageLink} totalPages={totalPages} /> */}

            {/* <PaginationNav currentPage={page} formatLink={formatPageLink} totalPages={totalPages} />
            {!!data.length && (
                <p className="text-color-secondary">
                    Showing {startRow} {lastRow > startRow ? `- ${lastRow}` : null} of {data.length}
                </p>
            )} */}
        </div>
    );
};
