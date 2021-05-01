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
import React from 'react';
import { Link } from 'react-router-dom';
import { useWorkflow } from '../../../hooks/api';
import { Code } from '../../Code';
import { Icon, Icons } from '../../Icon';
import { StreamStatePip } from '../../pips/StreamStatePip';
import style from './WorkflowStreamDetails.module.scss';

interface Props {
    clusterID: string;
    keyspace: string;
    workflowName: string;
    streamID: string;
}

export const WorkflowStreamDetails = ({ clusterID, keyspace, workflowName, streamID }: Props) => {
    const { data } = useWorkflow({ clusterID, keyspace, name: workflowName });
    const re = /(\S+)\-(\d+)$/.exec(streamID);

    if (!Array.isArray(re) || re.length < 3) {
        return null;
    }

    const shardKey = re[1];
    const sid = parseInt(re[2]);

    const shard =
        shardKey && shardKey in (data?.workflow?.shard_streams || {})
            ? (data?.workflow?.shard_streams || {})[shardKey]
            : null;

    if (!shard) {
        return null;
    }

    const stream = (shard.streams || []).find((s) => s.id === sid);
    if (!stream) {
        return null;
    }

    return (
        <div className={style.container}>
            <div className={style.section}>
                <div className={style.header}>
                    <div className={style.title}>
                        <StreamStatePip state={stream.state} /> <span>{streamID}</span>
                        {/* <div className="text-color-secondary font-size-small">{stream.state}</div> */}
                        <div className="font-size-small text-color-secondary">View full screen</div>
                    </div>
                    <div>
                        <Link to={`/workflow/${clusterID}/${keyspace}/${workflowName}/streams`}>
                            <Icon icon={Icons.delete} />
                        </Link>
                    </div>
                </div>
            </div>

            <div className={style.content}>
                <div className={style.section}>
                    <div className={style.sectionHeader}>General</div>
                    <table className={style.table}>
                        <thead>
                            <tr>
                                <th className={style.tableKey}></th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td className="text-align-right">State:</td>
                                <td className="font-family-monospace">
                                    <StreamStatePip state={stream.state} /> {stream.state}
                                </td>
                            </tr>
                            <tr>
                                <td className="text-align-right">Source:</td>
                                <td className="font-family-monospace">
                                    {stream.binlog_source?.keyspace}/{stream.binlog_source?.shard}
                                </td>
                            </tr>
                            <tr>
                                <td className="text-align-right">Target:</td>
                                <td className="font-family-monospace">
                                    {keyspace}/{stream.shard}
                                </td>
                            </tr>
                            <tr>
                                <td className="text-align-right">Tablet:</td>
                                <td className="font-family-monospace">
                                    {stream.tablet?.cell}-{stream.tablet?.uid}
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                {stream.state === 'Error' && (
                    <div className={style.section}>
                        <div className={style.sectionHeader}>
                            <StreamStatePip state={stream.state} /> Error
                        </div>
                        <div className="font-family-monospace"> {stream.message}</div>
                    </div>
                )}

                <div className={style.section}>
                    <div className={style.sectionHeader}>Replication lag</div>
                </div>

                <div className={style.section}>
                    <div className={style.sectionHeader}>Timeline</div>
                </div>

                <div className={style.section}>
                    <div className={style.sectionHeader}>Filter rules</div>
                    <div className="font-family-monospace">
                        <ol>
                            {(stream.binlog_source?.filter?.rules || []).map((rule, rdx) => (
                                <li>{JSON.stringify(rule, null, 2)}</li>
                            ))}
                        </ol>
                    </div>
                </div>

                <div className={style.section}>
                    <div className={style.sectionHeader}>Position</div>
                    <div className={style.position}>{stream.position}</div>
                </div>

                <div className={style.section}>
                    <div className={style.sectionHeader}>JSON</div>
                    <Code code={JSON.stringify(stream, null, 2)} />
                </div>
            </div>
        </div>
    );
};
