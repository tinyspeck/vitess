import { invertBy } from 'lodash-es';
import * as React from 'react';

import { topodata, vtadmin as pb, vtctldata } from '../../../proto/vtadmin';
import { TabletLink } from '../../links/TabletLink';
import style from './Stream.module.scss';

interface Props {
    keyspace: string;
    stream: vtctldata.Workflow.IStream;
    tablet: pb.Tablet | null | undefined;
}

export const Stream = ({ keyspace, stream, tablet }: Props) => {
    const [expanded, setExpanded] = React.useState<boolean>(false);

    const lag =
        typeof stream.time_updated?.seconds === 'number' && typeof stream.transaction_timestamp?.seconds === 'number'
            ? stream.time_updated.seconds - stream.transaction_timestamp.seconds
            : '-';

    // const uad = typeof stream.time_updated?.seconds === 'number' ? new Date(stream.time_updated.seconds * 1000) : null;

    return (
        <div className={style.panel} onClick={() => setExpanded(!expanded)}>
            <div className={style.metaRow}>
                <div className={style.field}>
                    <div className={style.label}>State</div>
                    {stream.state}
                </div>

                <div>
                    <div className={style.label}>Source Shard</div>
                    <code>
                        {stream.binlog_source?.keyspace}/{stream.binlog_source?.shard}
                    </code>
                </div>
                <div>
                    <div className={style.label}>Target Shard</div>
                    <code>
                        {keyspace}/{stream.shard}
                    </code>
                </div>

                <div className={style.field}>
                    <div className={style.label}>Tablet</div>
                    <TabletLink cell={stream.tablet?.cell} hostname={tablet?.tablet?.hostname} uid={stream.tablet?.uid}>
                        <code className="no-wrap">
                            {stream.tablet?.cell}-{stream.tablet?.uid}
                        </code>
                    </TabletLink>
                </div>

                <div>
                    <div className={style.label}>Replication Lag</div>
                    <code>{lag} seconds</code>
                </div>
            </div>
            {expanded && (
                <>
                    {stream.message && (
                        <div className={style.row}>
                            <div className={style.field}>
                                <div className={style.label}>Message</div>
                                <code>{stream.message}</code>
                            </div>
                        </div>
                    )}

                    <div className={style.row}>
                        <div className={style.field}>
                            <div className={style.label}>Filter Rules</div>
                            <table className={style.filterTable}>
                                <tbody>
                                    {(stream.binlog_source?.filter?.rules || []).map((f, fdx) => (
                                        <tr key={fdx}>
                                            <td>{fdx + 1}.</td>
                                            <td>
                                                Filter: <code>{f.filter}</code>
                                            </td>
                                            <td>
                                                Match: <code>{f.match}</code>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <div className={style.row}>
                        <div className={style.field}>
                            <div className={style.label}>Position</div>
                            <code>{stream.position}</code>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};
