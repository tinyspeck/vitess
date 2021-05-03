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
import { Link, Redirect, Route, Switch, useParams, useRouteMatch } from 'react-router-dom';

import style from './Workflow.module.scss';
import { useWorkflow } from '../../../hooks/api';
import { useDocumentTitle } from '../../../hooks/useDocumentTitle';
import { Code } from '../../Code';
import { Tab } from '../../tabs/Tab';
import { TabContainer } from '../../tabs/TabContainer';
import { WorkflowStreams } from './WorkflowStreams';
import { ButtonDropdown } from '../../ButtonDropdown';

interface RouteParams {
    clusterID: string;
    keyspace: string;
    name: string;
}

export const Workflow = () => {
    const { clusterID, keyspace, name } = useParams<RouteParams>();
    useDocumentTitle(name);

    let { path, url } = useRouteMatch();

    const { data } = useWorkflow({ clusterID, keyspace, name });

    return (
        <div className={style.container}>
            <header className={style.header}>
                <div className={style.headingMeta}>
                    <span className="font-family-monospace">
                        <Link to="/workflows">Workflows</Link>
                    </span>
                </div>
                <div className={style.titleContainer}>
                    <code>
                        <h1>{name}</h1>
                    </code>
                    <div>
                        <ButtonDropdown label="Actions">
                            <div className={style.actions}>
                                <div className={style.command}>
                                    <p className={style.commandTitle}>Stop the workflow</p>
                                    <code className={style.commandCode}>
                                        vtctlclient Workflow {keyspace}.{name} stop
                                    </code>
                                </div>
                                <div className={style.command}>
                                    <p className={style.commandTitle}>Delete the workflow</p>
                                    <code className={style.commandCode}>
                                        vtctlclient Workflow {keyspace}.{name} delete
                                    </code>
                                </div>
                            </div>
                        </ButtonDropdown>
                    </div>
                </div>
            </header>

            <TabContainer className={style.tabs}>
                <Tab to={`${url}/streams`}>Streams</Tab>
                <Tab to={`${url}/json`}>JSON</Tab>
            </TabContainer>

            <div className={style.content}>
                <Switch>
                    <Route path={`${path}/streams/:streamID*`}>
                        <WorkflowStreams clusterID={clusterID} keyspace={keyspace} name={name} />
                    </Route>

                    <Route path={`${path}/json`}>
                        <Code code={JSON.stringify(data, null, 2)} />
                    </Route>

                    <Redirect exact from={`${path}`} to={`${path}/streams`} />
                </Switch>
            </div>
        </div>
    );
};
