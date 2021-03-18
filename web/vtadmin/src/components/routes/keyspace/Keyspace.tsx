import { Link, Redirect, Route, Switch, useParams, useRouteMatch } from 'react-router-dom';
import style from './Keyspace.module.scss';
import { Tab, Tabs } from '../../Tabs';
import { Code } from '../../Code';
import { useKeyspaces } from '../../../hooks/api';

interface RouteParams {
    clusterID: string;
    name: string;
}

export const Keyspace = () => {
    let { path, url } = useRouteMatch();
    const { clusterID, name } = useParams<RouteParams>();

    const { data: keyspaces = [] } = useKeyspaces();

    const keyspace = keyspaces.find((k) => k.cluster?.id === clusterID && k.keyspace?.name === name);

    return (
        <div>
            <header className={style.header}>
                <p>
                    <Link to="/tablets">← All tablets</Link>
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

            <Tabs>
                <Tab to={`${url}/json`}>JSON</Tab>
            </Tabs>

            <Switch>
                <Route path={`${path}/json`}>
                    <Code code={JSON.stringify(keyspace, null, 2)} />
                </Route>
                <Redirect exact from={`${path}/`} to={`${path}/json`} />
            </Switch>
        </div>
    );
};
