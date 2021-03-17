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
import { Switch, useParams } from 'react-router';
import { Link, NavLink, Redirect, Route, useRouteMatch } from 'react-router-dom';

import { useWorkflow } from '../../hooks/api';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { Code } from '../Code';
import { Tab, Tabs } from '../Tabs';
import style from './Workflow.module.scss';
import { Streams } from './workflow/Streams';
import { WorkflowTablets } from './workflow/WorkflowTablets';

interface RouteParams {
    clusterID: string;
    keyspace: string;
    name: string;
}

export const Workflow = () => {
    const { clusterID, keyspace, name } = useParams<RouteParams>();
    const { data } = useWorkflow({ clusterID, keyspace, name }, { refetchInterval: 1000 });
    let { path, url } = useRouteMatch();

    useDocumentTitle(name);

    const shardStreams = Object.values(data?.workflow?.shard_streams || {});
    const numStreams = shardStreams.reduce((acc, ss) => (acc += (ss.streams || []).length), 0);

    return (
        <div>
            <header className={style.header}>
                <Link className={style.backButton} to="/workflows">
                    ← All workflows
                </Link>

                <h1>
                    <code>{name}</code>
                </h1>

                <div className={style.headingMeta}>
                    <span>Workflow</span>
                    <span>
                        Cluster: <code>{clusterID}</code>
                    </span>
                    <span>
                        Keyspace: <code>{keyspace}</code>
                    </span>
                </div>
            </header>

            <Tabs>
                <Tab to={`${url}/streams`} count={numStreams}>
                    Streams
                </Tab>
                <Tab to={`${url}/tablets`}>Tablets</Tab>
                <Tab to={`${url}/json`}>JSON</Tab>
            </Tabs>

            <Switch>
                <Route path={`${path}/streams`}>
                    <Streams clusterID={clusterID} keyspace={keyspace} name={name} />
                </Route>

                <Route path={`${path}/tablets`}>
                    <WorkflowTablets clusterID={clusterID} keyspace={keyspace} workflow={name} />
                </Route>

                <Route path={`${path}/json`}>
                    <div className={style.container}>
                        <Code code={JSON.stringify(data, null, 2)} />
                    </div>
                </Route>

                <Redirect exact from={`${path}/`} to={`${path}/streams`} />
            </Switch>
        </div>
    );
};
