import * as React from 'react';
import { useQuery } from 'react-query';
import { Link, useParams } from 'react-router-dom';

interface RouteParams {
    cluster: string;
    id: string;
}

export const WorkflowDetails = () => {
    const { cluster, id } = useParams<RouteParams>();
    const streamQuery = useQuery(['stream', { cluster, id }], async (queryKey, { cluster, id }) => {
        const result = await fetch(`http://localhost:8090/vrep/stream?cluster=${cluster}&id=${id}`);
        return (await result.json()) as string[];
    });
    const stream = streamQuery.data;

    return (
        <div>
            <Link to="/vrep/streams">← All workflows</Link>
            <h1>Workflow Details</h1>
            <pre>{JSON.stringify(stream, null, 2)}</pre>
        </div>
    );
};
