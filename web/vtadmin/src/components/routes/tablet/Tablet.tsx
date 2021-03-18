import * as React from 'react';
import { useQuery } from 'react-query';
import { Link, Redirect, Route, Switch, useParams, useRouteMatch } from 'react-router-dom';
import { useTablets } from '../../../hooks/api';
import { useDocumentTitle } from '../../../hooks/useDocumentTitle';
import { Code } from '../../Code';
import { vtadmin as pb } from '../../../proto/vtadmin';
import { fetchTabletVars, TabletVars } from '../../../api/tablet';
import style from './Tablet.module.scss';
import { TabletLink } from '../../links/TabletLink';
import { tabletFQDN } from '../../../util/tablet';
import { Tab, Tabs } from '../../Tabs';

interface RouteParams {
    clusterID: string;
    alias: string;
}

interface TabletVarsResponse {
    tablet: pb.Tablet;
    vars: TabletVars;
}

export const Tablet = () => {
    let { path, url } = useRouteMatch();
    const { clusterID, alias } = useParams<RouteParams>();

    useDocumentTitle(alias);
    const [cell, uid] = alias.split('-');

    const { data: tablets = [] } = useTablets();
    const tablet = tablets.find(
        (t) => t.cluster?.id === clusterID && t.tablet?.alias?.cell === cell && `${t.tablet?.alias?.uid}` === uid
    );

    const tq = useQuery<TabletVarsResponse, Error>(['/debug/vars', tablet], async () => {
        if (!tablet) return Promise.resolve({ tablet, vars: null } as any);
        const tv = await fetchTabletVars(tablet);
        return { tablet, vars: tv } as TabletVarsResponse;
    });

    const fqdn = tabletFQDN({
        cell: tablet?.tablet?.alias?.cell,
        hostname: tablet?.tablet?.hostname,
        uid: tablet?.tablet?.alias?.uid,
    });

    return (
        <div>
            <header className={style.header}>
                <p>
                    <Link to="/tablets">← All tablets</Link>
                </p>
                <code>
                    <h1>{alias}</h1>
                </code>
                <div className={style.headingMeta}>
                    <span>
                        Cluster: <code>{clusterID}</code>
                    </span>
                    <span>
                        Keyspace: <code>{tablet?.tablet?.keyspace}</code>
                    </span>
                    <span>
                        <TabletLink
                            cell={tablet?.tablet?.alias?.cell}
                            hostname={tablet?.tablet?.hostname}
                            uid={tablet?.tablet?.alias?.uid}
                        >
                            {fqdn}
                        </TabletLink>
                    </span>
                </div>
            </header>

            <Tabs>
                <Tab to={`${url}/json`}>JSON</Tab>
            </Tabs>

            <Switch>
                <Route path={`${path}/json`}>
                    <Code code={JSON.stringify(tq.data, null, 2)} />
                </Route>
                <Redirect exact from={`${path}/`} to={`${path}/json`} />
            </Switch>
        </div>
    );
};
