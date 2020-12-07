import * as React from 'react';

import style from './Workflows.module.scss';
import { VRepStreamList } from '../components/VRepStreamList';
import { Spinner } from '../components/Spinner';
import { useClusters, useVRepStreams } from '../hooks/api';

export const Workflows = () => {
    const clustersQuery = useClusters();
    const clusters = clustersQuery.data || [];

    const streamQuery = useVRepStreams({ clusters }, { enabled: !!clusters })
    const streams = streamQuery.data || [];
    const isLoading = clustersQuery.isLoading || streamQuery.isLoading;

    return (
        <div>
            <header className={style.header}>
                <h1>Workflows</h1>
                <div className={style.spinner}>{isLoading && <Spinner />}</div>
            </header>
            <VRepStreamList streams={streams} />
        </div>
    );
};
