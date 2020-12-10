import * as React from 'react';
import { Link, useParams } from 'react-router-dom';
import { useVRepStream } from '../hooks/api';

interface RouteParams {
    cluster: string;
    id: string;
}

export const WorkflowDetails = () => {
    const { cluster, id } = useParams<RouteParams>();
    const streamQuery = useVRepStream({ cluster, id })
    const stream = streamQuery.data;
    
    return (
        <div>
            <Link to="/vrep/streams">← All workflows</Link>
            <h1>Workflow Details</h1>
            <pre>{JSON.stringify(stream, null, 2)}</pre>
        </div>
    );
};
