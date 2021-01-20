import * as React from 'react';
import { useKeyspaces, useTablets } from '../../hooks/api';
import { groupBy } from 'lodash';
import { topodata } from '../../proto/vtadmin';

import style from './Keyspaces.module.scss';

const TABLET_TYPES = Object.keys(topodata.TabletType);

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
                        const tabletsByType = groupBy(
                            tabletsForKeyspace,
                            (t) => t.tablet && t.tablet.type && TABLET_TYPES[t.tablet.type]
                        );
                        console.log(tabletsByType, tabletsForKeyspace);
                        return (
                            <tr key={kdx}>
                                <td>
                                    <code>{k.cluster?.name}</code>
                                </td>
                                <td>
                                    <code>{k.keyspace?.name}</code>
                                </td>
                                <td>
                                    {Object.keys(tabletsByType).map((tabletType, idx) => (
                                        <span className={style.tabletType} key={tabletType}>
                                            <code>
                                                {(tabletsByType[tabletType] || []).length} {tabletType}
                                            </code>
                                        </span>
                                    ))}
                                </td>
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
