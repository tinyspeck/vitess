import * as React from 'react';
import { useQuery } from 'react-query';
import { Link, useParams } from 'react-router-dom';
import { useTablets } from '../../../hooks/api';
import { useDocumentTitle } from '../../../hooks/useDocumentTitle';
import { Code } from '../../Code';
import { vtadmin as pb } from '../../../proto/vtadmin';
import { fetchTabletVars, TabletVars } from '../../../api/tablet';
import style from './Tablet.module.scss';

interface RouteParams {
    clusterID: string;
    alias: string;
}

interface TabletVarsResponse {
    tablet: pb.Tablet;
    vars: TabletVars;
}

export const Tablet = () => {
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
                </div>
            </header>

            <h2>Tablet</h2>
            <Code code={JSON.stringify(tablet, null, 2)} />

            <h2>/debug/vars</h2>
            <Code code={JSON.stringify(tq.data, null, 2)} />
        </div>
    );
};
