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
import { Link, useParams } from 'react-router-dom';
import { useKeyspace } from '../../../hooks/api';
import { useDocumentTitle } from '../../../hooks/useDocumentTitle';

import style from './Keyspace.module.scss';

export interface RouteParams {
    clusterID: string | null | undefined;
    name: string | null | undefined;
}

export type NonNullableRouteParams = { [K in keyof RouteParams]: NonNullable<RouteParams[K]> };

export const Keyspace = () => {
    const { clusterID, name } = useParams<NonNullableRouteParams>();
    useDocumentTitle(`${name} (${clusterID})`);

    const { data: keyspace, ...kq } = useKeyspace({ clusterID, name });
    console.log(keyspace, kq);

    return (
        <div>
            <header className={style.header}>
                <p>
                    <Link to="/keyspaces">← All keyspaces</Link>
                </p>
                <code>
                    <h1>{name}</h1>
                </code>
                <div className={style.headingMeta}>
                    <span>Keyspace</span>
                    <span>
                        Cluster: <code>{clusterID}</code>
                    </span>
                </div>
            </header>
        </div>
    );
};
