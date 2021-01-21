import * as React from 'react';
import { useGates } from '../../hooks/api';
import { groupBy } from 'lodash';
import { topodata } from '../../proto/vtadmin';

import style from './Keyspaces.module.scss';

export const VTGates = () => {
    const { data, error, isError, isSuccess } = useGates();
    console.log(data);

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
                        <th>Hostname</th>
                        <th>Keyspaces</th>
                    </tr>
                </thead>
                <tbody>
                    {data.map((v, idx) => {
                        return (
                            <tr key={idx}>
                                <td>
                                    <code>cluster1</code>
                                </td>
                                <td>
                                    <code>{v.hostname}</code>
                                </td>
                                <td>-</td>
                            </tr>
                        );
                    })}
                    {/* {data.map((k, kdx) => {
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
                    })} */}
                </tbody>
            </table>
        );
    }

    return (
        <div style={{ maxWidth: 1600 }}>
            <h1>VTGates</h1>
            <div style={{ marginTop: 24 }}>{content}</div>
        </div>
    );
};
