/**
 * Copyright 2021 The Vitess Authors.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import style from './WorkflowStreamSidebar.module.scss';
import { useWorkflow } from '../../../hooks/api';
import { formatStreamKey, getStreams, getStreamSource, getStreamTarget } from '../../../util/workflows';
import { WorkspaceSidebarHeader } from '../../layout/WorkspaceSidebarHeader';
import { Button } from '../../Button';
import { formatAlias } from '../../../util/tablets';
import { StreamStatePip } from '../../pips/StreamStatePip';
import { formatDateTime, formatRelativeTime } from '../../../util/time';

interface Props {
    clusterID: string;
    keyspace: string;
    onClose?: () => void;
    workflowName: string;
    streamKey: string;
}

export const WorkflowStreamSidebar = ({ clusterID, keyspace, onClose, streamKey, workflowName }: Props) => {
    const { data: workflow } = useWorkflow(
        {
            clusterID: clusterID,
            keyspace: keyspace,
            name: workflowName,
        },
        { refetchInterval: 1000 }
    );

    const stream = getStreams(workflow).find((s) => formatStreamKey(s) === streamKey);

    return (
        <div className={style.container}>
            <WorkspaceSidebarHeader onClose={onClose} title={streamKey}>
                <div className={style.header}>
                    <Button secondary size="small">
                        View details
                    </Button>
                </div>
            </WorkspaceSidebarHeader>

            <div className={style.content}>
                <section>
                    <table className={style.metadata}>
                        <tbody>
                            <tr>
                                <td className={style.colKey}>Stream key:</td>{' '}
                                <td className={style.colValue}>{streamKey}</td>
                            </tr>
                            <tr>
                                <td className={style.colKey}>State:</td>{' '}
                                <td className={style.colValue}>
                                    <StreamStatePip state={stream?.state} /> {stream?.state}
                                </td>
                            </tr>
                            <tr>
                                <td className={style.colKey}>Source:</td>{' '}
                                <td className={style.colValue}>{getStreamSource(stream)} </td>
                            </tr>
                            <tr>
                                <td className={style.colKey}>Target:</td>{' '}
                                <td className={style.colValue}>{getStreamTarget(stream, keyspace)}</td>
                            </tr>
                            <tr>
                                <td className={style.colKey}>Tablet:</td>{' '}
                                <td className={style.colValue}>{formatAlias(stream?.tablet)}</td>
                            </tr>
                            <tr>
                                <td className={style.colKey}>Updated:</td>{' '}
                                <td className={style.colValue}>{formatDateTime(stream?.time_updated?.seconds)}</td>
                            </tr>
                        </tbody>
                    </table>
                </section>

                <section>
                    <div className={style.sectionTitle}>Timeline</div>
                    <div className={style.logsContainer}>
                        {(stream?.logs || []).map((log) => (
                            <div className={style.log}>
                                <div>{formatDateTime(log.updated_at?.seconds)}</div>
                                <div>{log.type}</div>
                                {/* <div>{log.message}</div> */}
                            </div>
                        ))}
                    </div>
                </section>

                <section>
                    <div className={style.sectionTitle}>Debug</div>
                    {JSON.stringify(stream, null, 2)}
                </section>
            </div>
        </div>
    );
};