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

import style from './WorkspaceSidebar.module.scss';

interface Props {
    hidden?: boolean;
}

export const WorkspaceSidebar: React.FunctionComponent<Props> = ({ children, hidden }) => {
    if (!children) return null;

    const containerClass = cx(style.container, {
        [style.hidden]: !!hidden,
    });

    return (
        <div className={containerClass}>
            <div className={style.innerContainer}>
                <div className={style.content}>{children}</div>
                <div className={style.resizer} />
            </div>
        </div>
    );
};