import { invertBy, times } from 'lodash-es';
import * as React from 'react';
import cx from 'classnames';
import sparkline from '@fnando/sparkline';

import { topodata, vtadmin as pb, vtctldata } from '../../../proto/vtadmin';
import { TabletLink } from '../../links/TabletLink';
import style from './Stream.module.scss';

interface Props {
    keyspace: string;
    stream: vtctldata.Workflow.IStream;
    tablet: pb.Tablet | null | undefined;
}

export const Stream = ({ keyspace, stream, tablet }: Props) => {
    const containerRef = React.useRef(null);
    const sparklineRef = React.useRef(null);

    const [expanded, setExpanded] = React.useState<boolean>(false);
    const [lagData, setLagData] = React.useState<number[]>([...times(29, () => 0), 0.000001]);

    const lag =
        typeof stream.time_updated?.seconds === 'number' && typeof stream.transaction_timestamp?.seconds === 'number'
            ? stream.time_updated.seconds - stream.transaction_timestamp.seconds
            : 0;

    // const uad = typeof stream.time_updated?.seconds === 'number' ? new Date(stream.time_updated.seconds * 1000) : null;
    const sts = stream.state ? stream.state.toLowerCase() : null;
    const pipClass = cx(style.pip, {
        [style.error]: sts === 'error',
        [style.ok]: sts === 'running' || sts === 'copying',
    });

    React.useEffect(() => {
        sparkline(sparklineRef.current, lagData);
    }, []);

    React.useEffect(() => {
        let nextLagData = [...lagData];
        nextLagData.push(lag);
        nextLagData = nextLagData.slice(Math.max(nextLagData.length - 29, 1), 30);
        sparkline(sparklineRef.current, nextLagData);
        setLagData(nextLagData);
    }, [stream]);

    const onClickContainer: React.MouseEventHandler<HTMLDivElement> = (e) => {
        if (expanded && containerRef.current === e.target) {
            setExpanded(false);
        } else {
            setExpanded(true);
        }
    };

    return (
        <div className={style.panel} onClick={onClickContainer} ref={containerRef}>
            <div className={style.inner}>
                <div className={style.metaRow}>
                    <div className={style.field}>
                        <div className={style.label}>State</div>
                        <div>
                            <span className={pipClass} /> {stream.state}
                        </div>
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
                        <TabletLink
                            cell={stream.tablet?.cell}
                            hostname={tablet?.tablet?.hostname}
                            uid={stream.tablet?.uid}
                        >
                            <code className="no-wrap">
                                {stream.tablet?.cell}-{stream.tablet?.uid}
                            </code>
                        </TabletLink>
                    </div>

                    {/* Sparkline */}
                    <div>
                        <div className={style.label}>Replication Lag</div>
                        <div className={style.sparkline}>
                            <svg ref={sparklineRef} width="100" height="20" strokeWidth="1"></svg>
                        </div>
                        <code>{lag} s</code>
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
        </div>
    );
};
