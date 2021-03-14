import { invertBy } from 'lodash-es';

import { topodata, vtadmin as pb, vtctldata } from '../../../proto/vtadmin';
import { TabletLink } from '../../links/TabletLink';
import style from './Stream.module.scss';

interface Props {
    keyspace: string;
    stream: vtctldata.Workflow.IStream;
    tablet: pb.Tablet | null | undefined;
}

export const Stream = ({ keyspace, stream, tablet }: Props) => {
    const lag =
        typeof stream.time_updated?.seconds === 'number' && typeof stream.transaction_timestamp?.seconds === 'number'
            ? stream.time_updated.seconds - stream.transaction_timestamp.seconds
            : '-';

    // const uad = typeof stream.time_updated?.seconds === 'number' ? new Date(stream.time_updated.seconds * 1000) : null;

    return (
        <div className={style.panel}>
            <div className={style.row}>
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

                <div>
                    <div className={style.label}>Updated at</div>
                    <code>{stream.time_updated?.seconds}</code>
                </div>

                <div>
                    <div className={style.label}>Replication Lag</div>
                    <code>{lag} seconds</code>
                </div>
            </div>

            {/* Tablet metadata */}
            <div className={style.row}>
                <div className={style.field}>
                    <div className={style.label}>Tablet</div>
                    <TabletLink cell={stream.tablet?.cell} hostname={tablet?.tablet?.hostname} uid={stream.tablet?.uid}>
                        <code>
                            {stream.tablet?.cell}-{stream.tablet?.uid} (
                            {tablet && tablet.tablet?.type && TABLET_TYPES[tablet.tablet.type]} -{' '}
                            {tablet && tablet.state && TABLET_STATES[tablet.state]})
                        </code>
                    </TabletLink>
                </div>
            </div>

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
                    <div className={style.label}>Position</div>
                    <code>{stream.position}</code>
                </div>
            </div>
        </div>
    );
};

// TABLET_TYPES maps numeric tablet types back to human readable strings.
// Note that topodata.TabletType allows duplicate values: specifically,
// both RDONLY (new name) and BATCH (old name) share the same numeric value.
// So, we make the assumption that if there are duplicate keys, we will
// always take the first value.
const TABLET_TYPES = Object.entries(invertBy(topodata.TabletType)).reduce((acc, [k, vs]) => {
    acc[k] = vs[0];
    return acc;
}, {} as { [k: string]: string });

const TABLET_STATES = Object.keys(pb.Tablet.ServingState);
