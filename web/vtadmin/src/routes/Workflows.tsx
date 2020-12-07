import * as React from 'react';

import style from './Workflows.module.scss';
import { VRepStreamList } from '../components/VRepStreamList';
import { Spinner } from '../components/Spinner';
import { useClusters, useVRepStreams } from '../hooks/api';
import { QueryError } from '../components/QueryError';

export const Workflows = () => {
    const clustersQuery = useClusters();
    const clusters = clustersQuery.data || [];
    console.log(clustersQuery)

    const streamQuery = useVRepStreams({ clusters }, { enabled: !!clusters })
    const streams = streamQuery.data || [];
    const isLoading = clustersQuery.isFetching || streamQuery.anyFetching;


    let content = <VRepStreamList streams={streams} />
    if (clustersQuery.isError) {
        content = (
            <QueryError query={clustersQuery}>
                <p>Could not fetch clusters</p>
            </QueryError>
        )
    }

    return (
        <div>
            <header className={style.header}>
                <h1>Workflows</h1>
                <div className={style.spinner}>{isLoading && <Spinner />}</div>
            </header>
            {content}            
        </div>
    );
};
