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

import { Column, useExpanded, useGroupBy, useSortBy, useTable } from 'react-table';
import { DataHeader } from './DataHeader';

interface Props<T extends object> {
    columns: Column<T>[];
    data: T[];
}

export const DataTable2 = <T extends object>({ columns, data }: Props<T>) => {
    const table = useTable(
        {
            // See https://react-table.tanstack.com/docs/faq#how-do-i-stop-my-table-state-from-automatically-resetting-when-my-data-changes
            autoResetExpanded: false,
            autoResetGroupBy: false,
            autoResetSortBy: false,
            columns,
            data,
        },
        // Order of plugins matters
        useGroupBy,
        useSortBy,
        useExpanded
    );

    return (
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
                {table.rows.map((row) => {
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
    );
};
