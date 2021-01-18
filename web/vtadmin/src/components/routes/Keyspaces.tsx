import * as React from 'react';
import { useKeyspaces, useTablets } from '../../hooks/api';
import { groupBy } from 'lodash';

export const Keyspaces = () => {
    const { data, error, isError, isSuccess } = useKeyspaces();
    const { data: tdata } = useTablets();

    // Placeholder UI :D
    let content = <div>Loading...</div>;
    if (isError) {
        content = (
            <div>
                {error?.name}: {error?.message}
            </div>
        );
    } else if (isSuccess && Array.isArray(data)) {
        content = (
            <table>
                <thead>
                    <tr>
                        <th>Cluster</th>
                        <th>Name</th>
                        <th>Tablets</th>
                    </tr>
                </thead>
                <tbody>
                    {data.map((k, kdx) => {
                        const tabletsForKeyspace = (tdata || []).filter((t) => t.tablet?.keyspace === k.keyspace?.name);
                        return (
                            <tr key={kdx}>
                                <td>{k.cluster?.name}</td>
                                <td>{k.keyspace?.name}</td>
                                <td>{tabletsForKeyspace.length} tablets</td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        );
    }

    return (
        <div style={{ maxWidth: 1600 }}>
            <h1>Keyspaces</h1>
            <div style={{ marginTop: 24 }}>{content}</div>
        </div>
    );
};
