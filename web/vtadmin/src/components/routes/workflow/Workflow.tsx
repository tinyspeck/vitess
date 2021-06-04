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
import { NavCrumbs } from '../../layout/NavCrumbs';
import { WorkspaceHeader } from '../../layout/WorkspaceHeader';
import { WorkspaceTitle } from '../../layout/WorkspaceTitle';
import { useDocumentTitle } from '../../../hooks/useDocumentTitle';
import { KeyspaceLink } from '../../links/KeyspaceLink';
import { WorkflowStreams } from './WorkflowStreams';
import { ContentContainer } from '../../layout/ContentContainer';
import { TabContainer } from '../../tabs/TabContainer';
import { Tab } from '../../tabs/Tab';
import { getStreams } from '../../../util/workflows';
import { Code } from '../../Code';
import { Workspace } from '../../layout/Workspace';
import { WorkspaceContent } from '../../layout/WorkspaceContent';
import { WorkspaceSidebar } from '../../layout/WorkspaceSidebar';
import { WorkspaceNav } from '../../layout/WorkspaceNav';
import { useURLQuery } from '../../../hooks/useURLQuery';
import { WorkflowStreamSidebar } from './WorkflowStreamSidebar';
import { WorkflowTabletSidebar } from './WorkflowTabletSidebar';

interface RouteParams {
    clusterID: string;
    keyspace: string;
    name: string;
}

export const Workflow = () => {
    const { clusterID, keyspace, name } = useParams<RouteParams>();
    const { path, url } = useRouteMatch();
    const { pushQuery, query } = useURLQuery();

    useDocumentTitle(`${name} (${keyspace})`);

    const { data } = useWorkflow({ clusterID, keyspace, name }, { refetchInterval: 1000 });
    const streams = getStreams(data);

    const closeSidebar = () => {
        pushQuery({ stream: undefined, tablet: undefined });
    };

    return (
        <Workspace>
            <WorkspaceNav>
                <NavCrumbs>
                    <Link to="/workflows">Workflows</Link>
                </NavCrumbs>
            </WorkspaceNav>
            <WorkspaceContent>
                <WorkspaceHeader>
                    <WorkspaceTitle className="font-family-monospace">{name}</WorkspaceTitle>
                    <div className={style.headingMeta}>
                        <span>
                            Cluster: <code>{clusterID}</code>
                        </span>
                        <span>
                            Target keyspace:{' '}
                            <KeyspaceLink clusterID={clusterID} name={keyspace}>
                                <code>{keyspace}</code>
                            </KeyspaceLink>
                        </span>
                    </div>
                </WorkspaceHeader>

                <ContentContainer>
                    <TabContainer>
                        <Tab text="Streams" to={`${url}/streams`} count={streams.length} />
                        <Tab text="JSON" to={`${url}/json`} />
                    </TabContainer>

                    <Switch>
                        <Route path={`${path}/streams`}>
                            <WorkflowStreams clusterID={clusterID} keyspace={keyspace} name={name} />
                        </Route>

                        <Route path={`${path}/json`}>
                            <Code code={JSON.stringify(data, null, 2)} />
                        </Route>

                        <Redirect exact from={path} to={`${path}/streams`} />
                    </Switch>
                </ContentContainer>

                {(!!query.stream || !!query.tablet) && (
                    <WorkspaceSidebar>
                        {typeof query.stream === 'string' && (
                            <WorkflowStreamSidebar
                                clusterID={clusterID}
                                keyspace={keyspace}
                                onClose={closeSidebar}
                                streamKey={query.stream}
                                workflowName={name}
                            />
                        )}

                        {typeof query.tablet === 'string' && (
                            <WorkflowTabletSidebar alias={query.tablet} clusterID={clusterID} onClose={closeSidebar} />
                        )}
                    </WorkspaceSidebar>
                )}
            </WorkspaceContent>
        </Workspace>
    );
};
