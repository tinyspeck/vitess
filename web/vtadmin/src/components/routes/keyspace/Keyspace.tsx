import * as React from 'react';
import { Link, Redirect, Route, Switch, useParams, useRouteMatch } from 'react-router-dom';
import style from './Keyspace.module.scss';
import { Tab, Tabs } from '../../Tabs';
import { Code } from '../../Code';
import { useKeyspaces, useTablets } from '../../../hooks/api';
import { DataTable } from '../../dataTable/DataTable';
import { vtadmin as pb, topodata } from '../../../proto/vtadmin';

import { invertBy, orderBy } from 'lodash-es';
import { useDocumentTitle } from '../../../hooks/useDocumentTitle';
import { TabletLink } from '../../links/TabletLink';

interface RouteParams {
    clusterID: string;
    name: string;
}

export const Keyspace = () => {
    let { path, url } = useRouteMatch();
    const { clusterID, name } = useParams<RouteParams>();

    useDocumentTitle(name);

    const { data: keyspaces = [] } = useKeyspaces();
    const { data: tablets = [] } = useTablets();

    const keyspace = keyspaces.find((k) => k.cluster?.id === clusterID && k.keyspace?.name === name);
    const kst = tablets.filter((t) => t.tablet?.keyspace === name && t.cluster?.id === clusterID);

    const renderRows = (rows: typeof kst) => {
        return rows.map((t, tdx) => {
            return (
                <tr key={`${t.tablet?.hostname}-${tdx}`}>
                    <td>
                        <code>{t.tablet?.shard}</code>
                    </td>
                    <td>
                        <code>{formatAlias(t)}</code>
                    </td>
                    <td>
                        <code>{formatDisplayType(t)}</code>
                    </td>
                    <td>
                        <code>{formatState(t)}</code>
                    </td>
                    <td>
                        <TabletLink
                            cell={t.tablet?.alias?.cell}
                            hostname={t.tablet?.hostname}
                            uid={t.tablet?.alias?.uid}
                        >
                            <code>{t.tablet?.hostname}</code>
                        </TabletLink>
                    </td>
                </tr>
            );
        });
    };

    console.log(kst);

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

            <Tabs>
                <Tab to={`${url}/shards`}>Shards</Tab>
                <Tab to={`${url}/json`}>JSON</Tab>
            </Tabs>

            <Switch>
                <Route path={`${path}/shards`}>
                    <DataTable
                        columns={['Shard', 'Alias', 'Type', 'State', 'Hostname']}
                        data={kst}
                        renderRows={renderRows}
                    />
                </Route>
                <Route path={`${path}/json`}>
                    <Code code={JSON.stringify(keyspace, null, 2)} />
                </Route>
                <Redirect exact from={`${path}/`} to={`${path}/shards`} />
            </Switch>
        </div>
    );
};

const SERVING_STATES = Object.keys(pb.Tablet.ServingState);

// TABLET_TYPES maps numeric tablet types back to human readable strings.
// Note that topodata.TabletType allows duplicate values: specifically,
// both RDONLY (new name) and BATCH (old name) share the same numeric value.
// So, we make the assumption that if there are duplicate keys, we will
// always take the first value.
const TABLET_TYPES = Object.entries(invertBy(topodata.TabletType)).reduce((acc, [k, vs]) => {
    acc[k] = vs[0];
    return acc;
}, {} as { [k: string]: string });

const formatAlias = (t: pb.Tablet) =>
    t.tablet?.alias?.cell && t.tablet?.alias?.uid && `${t.tablet.alias.cell}-${t.tablet.alias.uid}`;

const formatType = (t: pb.Tablet) => {
    return t.tablet?.type && TABLET_TYPES[t.tablet?.type];
};

const formatDisplayType = (t: pb.Tablet) => {
    const tt = formatType(t);
    return tt === 'MASTER' ? 'PRIMARY' : tt;
};

const formatState = (t: pb.Tablet) => t.state && SERVING_STATES[t.state];
