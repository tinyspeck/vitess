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
import { Link, Redirect, Route, Switch, useParams, useRouteMatch } from 'react-router-dom';
import { useKeyspace, useKeyspaces, useWorkflows } from '../../hooks/api';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { Tab } from '../tabs/Tab';
import { TabList } from '../tabs/TabList';

import style from './Keyspace.module.scss';
import { KeyspaceSchemas } from './keyspace/KeyspaceSchemas';
import { KeyspaceShards } from './keyspace/KeyspaceShards';
import { KeyspaceVSchema } from './keyspace/KeyspaceVSchema';
import { KeyspaceWorkflows } from './keyspace/KeyspaceWorkflows';

interface RouteParams {
    clusterID: string;
    name: string;
}

export const Keyspace = () => {
    const { clusterID, name } = useParams<RouteParams>();
    let { path, url } = useRouteMatch();

    useDocumentTitle(`${name} (${clusterID})`);

    const { data: keyspace, ...ksQuery } = useKeyspace({ clusterID, name });
    const { data: workflows, ...wq } = useWorkflows();

    const is404 = ksQuery.isSuccess && !keyspace;
    if (is404) {
        return <div>404</div>;
    }

    const workflowsForKs = (workflows || []).filter(
        (w) =>
            w.cluster?.id === clusterID &&
            (w.workflow?.source?.keyspace === name || w.workflow?.target?.keyspace === name)
    );

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
                    <span>
                        Cluster: <code>{clusterID}</code>
                    </span>
                </div>
            </header>

            <TabList>
                <Tab
                    text={ksQuery.isLoading ? 'Shards' : `Shards (${Object.values(keyspace?.shards || {}).length})`}
                    to={`${url}/shards`}
                />
                <Tab text="Schemas" to={`${url}/schemas`} />
                <Tab text="VSchema" to={`${url}/vschema`} />
                <Tab
                    text={wq.isLoading ? 'Workflows' : `Workflows (${workflowsForKs.length})`}
                    to={`${url}/workflows`}
                />
            </TabList>

            <div className={style.container}>
                <Switch>
                    <Route exact path={`${path}/shards`}>
                        <KeyspaceShards clusterID={clusterID} name={name} />
                    </Route>

                    <Route exact path={`${path}/schemas`}>
                        <KeyspaceSchemas />
                    </Route>

                    <Route exact path={`${path}/vschema`}>
                        <KeyspaceVSchema clusterID={clusterID} name={name} />
                    </Route>

                    <Route exact path={`${path}/workflows`}>
                        <KeyspaceWorkflows clusterID={clusterID} name={name} />
                    </Route>

                    <Redirect exact from={`${path}`} to={`${path}/shards`} />
                </Switch>
            </div>
        </div>
    );
};
