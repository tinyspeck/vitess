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

import cx from 'classnames';
import { ColumnInstance } from 'react-table';

import style from './DataHeader.module.scss';

interface Props<T extends object> {
    column: ColumnInstance<T>;
}

export const DataHeader = <T extends object>({ column }: Props<T>) => {
    return (
        <th {...column.getHeaderProps(column.getSortByToggleProps())}>
            {column.canGroupBy ? (
                // If the column can be grouped, let's add a toggle
                <span {...column.getGroupByToggleProps()}>{column.isGrouped ? '🛑 ' : '👊 '}</span>
            ) : null}
            {column.render('Header')}
            <span>{column.isSorted ? (column.isSortedDesc ? ' 🔽' : ' 🔼') : ''}</span>
        </th>
    );
};
