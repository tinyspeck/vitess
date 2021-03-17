import * as React from 'react';
import { useParams } from 'react-router-dom';
import { useTablets } from '../../../hooks/api';
import { useDocumentTitle } from '../../../hooks/useDocumentTitle';
import { Code } from '../../Code';

interface RouteParams {
    clusterID: string;
    alias: string;
}

export const Tablet = () => {
    const { clusterID, alias } = useParams<RouteParams>();
    useDocumentTitle(alias);

    const [cell, uid] = alias.split('-');
    const { data: tablets = [] } = useTablets();
    const tablet = tablets.find(
        (t) => t.cluster?.id === clusterID && t.tablet?.alias?.cell === cell && `${t.tablet?.alias?.uid}` === uid
    );

    return (
        <div>
            <h1>{alias}</h1>
            <Code code={JSON.stringify(tablet, null, 2)} />
        </div>
    );
};
