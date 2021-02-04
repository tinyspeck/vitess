/**
 * Copyright 2020 The Vitess Authors.
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
import { vtadmin as pb, topodata } from '../proto/vtadmin';

interface Props {
    tablets: pb.Tablet[];
}

const SERVING_STATES = Object.keys(pb.Tablet.ServingState);
const TABLET_TYPES = Object.keys(topodata.TabletType);

export const TabletList = ({ tablets }: Props) => {
    return (
        <table>
            <thead>
                <tr>
                    <th>Cluster</th>
                    <th>Keyspace</th>
                    <th>Shard</th>
                    <th>Alias</th>
                    <th>Hostname</th>

                    <th>Type</th>
                    <th>State</th>
                </tr>
            </thead>
            <tbody>
                {tablets.map((t, tdx) => (
                    <tr key={tdx}>
                        <td>
                            🇺🇸 <a href="#">{t.cluster?.name}</a>
                        </td>
                        <td>
                            <a href="#">{t.tablet?.keyspace}</a>
                        </td>
                        <td>
                            <a href="#">{t.tablet?.shard}</a>
                        </td>
                        <td>
                            <a href="#">{formatAlias(t)}</a>
                        </td>
                        <td>
                            <a href="#">{t.tablet?.hostname}</a>
                        </td>
                        <td>
                            <div
                                style={{
                                    background: '#4cba6a',
                                    borderRadius: 100,
                                    display: 'inline-block',
                                    height: 10,
                                    verticalAlign: 'middle',
                                    width: 10,
                                }}
                            />{' '}
                            {formatType(t)}
                        </td>
                        <td>{formatState(t)}</td>
                    </tr>
                ))}
            </tbody>
        </table>
    );
};

const formatAlias = (t: pb.Tablet) =>
    t.tablet?.alias?.cell && t.tablet?.alias?.uid && `${t.tablet.alias.cell}-${t.tablet.alias.uid}`;

const formatType = (t: pb.Tablet) => t.tablet?.type && TABLET_TYPES[t.tablet?.type];

const formatState = (t: pb.Tablet) => t.state && SERVING_STATES[t.state];
