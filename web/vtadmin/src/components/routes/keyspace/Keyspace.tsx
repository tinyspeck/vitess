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
import * as React from 'react';
import { useParams } from 'react-router';
import { Link, Redirect, Route, Switch, useRouteMatch } from 'react-router-dom';

import style from './Keyspace.module.scss';
import { useDocumentTitle } from '../../../hooks/useDocumentTitle';
import { NavCrumbs } from '../../layout/NavCrumbs';
import { WorkspaceHeader } from '../../layout/WorkspaceHeader';
import { WorkspaceTitle } from '../../layout/WorkspaceTitle';
import { useKeyspaces } from '../../../hooks/api';
import { KeyspaceShards } from './KeyspaceShards';
import { ContentContainer } from '../../layout/ContentContainer';
import { TabContainer } from '../../tabs/TabContainer';
import { Tab } from '../../tabs/Tab';
import { KeyspaceSchemas } from './KeyspaceSchemas';

interface RouteParams {
    clusterID: string;
    name: string;
}

export const Keyspace = () => {
    const { clusterID, name } = useParams<RouteParams>();
    useDocumentTitle(`${name} (${clusterID})`);

    const { path, url } = useRouteMatch();

    const { data: keyspaces = [] } = useKeyspaces();
    const keyspace = keyspaces.find((k) => k.cluster?.id === clusterID && k.keyspace?.name === name);

    const shardCount = Object.keys(keyspace?.shards || []).length;

    return (
        <div>
            <WorkspaceHeader>
                <NavCrumbs>
                    <Link to="/keyspaces">Keyspaces</Link>
                </NavCrumbs>

                <WorkspaceTitle className="font-family-monospace">{name}</WorkspaceTitle>

                <div className={style.headingMeta}>
                    <span>
                        Cluster: <code>{clusterID}</code>
                    </span>
                </div>
            </WorkspaceHeader>

            <ContentContainer>
                <TabContainer>
                    <Tab text="Shards" to={`${url}/shards`} count={shardCount} size="large" />
                    <Tab text="Schemas" to={`${url}/schemas`} size="large" />
                </TabContainer>
                <Switch>
                    <Route path={`${path}/shards`}>
                        <KeyspaceShards keyspace={keyspace} />
                    </Route>

                    <Route path={`${path}/schemas`}>
                        <KeyspaceSchemas keyspace={keyspace} />
                    </Route>

                    <Redirect exact from={path} to={`${path}/shards`} />
                </Switch>
            </ContentContainer>
        </div>
    );
};
