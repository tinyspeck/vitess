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
import * as React from 'react';
import { NavLink } from 'react-router-dom';

import style from './Tab.module.scss';

interface Props {
    activeClassName?: string;
    className?: string;
    count?: number;
    size?: 'large' | 'medium' | 'small';
    text: string;
    to: string;
}

export const Tab = ({ activeClassName, className, count, size = 'medium', text, to }: Props) => {
    return (
        <NavLink
            activeClassName={cx(style.active, activeClassName)}
            className={cx(style.tab, className, style[size])}
            to={to}
        >
            {text} {typeof count === 'number' && <span className={style.count}>{count}</span>}
        </NavLink>
    );
};
