import { times } from 'lodash-es';
import * as React from 'react';
import cx from 'classnames';
import sparkline from '@fnando/sparkline';

import { vtadmin as pb, vtctldata } from '../../../proto/vtadmin';
import style from './Stream.module.scss';
import { Link } from 'react-router-dom';

interface Props {
    clusterID: string;
    keyspace: string;
    stream: vtctldata.Workflow.IStream;
    tablet: pb.Tablet | null | undefined;
}

export const Stream = ({ clusterID, keyspace, stream, tablet }: Props) => {
    const containerRef = React.useRef(null);
    const sparklineRef = React.useRef(null);

    const isError = !!stream.state && stream.state.toLowerCase() === 'error';
    const [expanded, setExpanded] = React.useState<boolean>(isError);
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
        /* eslint-disable-next-line react-hooks/exhaustive-deps */
    }, []);

    React.useEffect(() => {
        let nextLagData = [...lagData];
        nextLagData.push(lag);
        nextLagData = nextLagData.slice(Math.max(nextLagData.length - 29, 1), 30);
        sparkline(sparklineRef.current, nextLagData);
        setLagData(nextLagData);
        /* eslint-disable-next-line react-hooks/exhaustive-deps */
    }, [stream]);

    const panelClass = cx(style.panel, {
        [style.errorPanel]: isError,
    });

    return (
        <div className={panelClass} ref={containerRef}>
            <div className={style.inner}>
                <div className={style.metaRow}>
                    <div className={style.field}>
                        <div className={style.label}>State</div>
                        <div>
                            <span className={pipClass} /> {stream.state}
                        </div>
                    </div>

                    <div>
                        <div className={style.label}>Source</div>
                        <Link to={`/keyspace/${clusterID}/${stream.binlog_source?.keyspace}`}>
                            <code>
                                {stream.binlog_source?.keyspace}/{stream.binlog_source?.shard}
                            </code>
                        </Link>
                    </div>
                    <div>
                        <div className={style.label}>Target</div>

                        <Link to={`/keyspace/${clusterID}/${keyspace}`}>
                            <code>
                                {keyspace}/{stream.shard}
                            </code>
                        </Link>
                    </div>

                    <div className={style.field}>
                        <div className={style.label}>Tablet</div>
                        <Link to={`/tablet/${clusterID}/${tablet?.tablet?.alias?.cell}-${tablet?.tablet?.alias?.uid}`}>
                            <code className="no-wrap">
                                {stream.tablet?.cell}-{stream.tablet?.uid}
                            </code>
                        </Link>
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
                        {/* Timestamps */}
                        <div className={style.timestampRow}>
                            <div className={style.field}>
                                <div className={style.label}>Updated at</div>
                                <div>{stream.time_updated?.seconds}</div>
                            </div>
                            <div className={style.field}>
                                <div className={style.label}>Txn timestamp</div>
                                <div>{stream.transaction_timestamp?.seconds}</div>
                            </div>
                        </div>

                        {/* Message */}
                        {stream.message && (
                            <div className={style.row}>
                                <div className={style.field}>
                                    <div className={style.label}>Message</div>
                                    <code>{stream.message}</code>
                                </div>
                            </div>
                        )}

                        {/* Filter rules */}
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

                        {/* Position */}
                        <div className={style.row}>
                            <div className={style.field}>
                                <div className={style.label}>Position</div>
                                <code>{stream.position}</code>
                            </div>
                        </div>
                    </>
                )}
            </div>
            <div className={style.toggle} onClick={() => setExpanded(!expanded)}>
                {expanded ? 'Hide' : 'Expand'}
            </div>
        </div>
    );
};
