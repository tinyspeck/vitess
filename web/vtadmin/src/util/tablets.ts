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
import { invertBy } from 'lodash-es';
import { topodata, vtadmin as pb } from '../proto/vtadmin';

/**
 * TabletDebugVars is a best-effort typing of the /debug/vars tablet endpoint.
 * Only fields read by VTAdmin are defined here.
 *
 * A good future enhancement is a proto-typed gRPC endpoint in vtadmin.proto,
 * from which we can generate TypeScript typings vs. having to duplicate them here.
 * This would also offer us actual runtime type safety by way of protobufjs's
 * generated validate() functions. For now, everything in here is optional (hence
 * the Partial<>) and not guaranteed to be defined in every Vitess deployment.
 */
export type TabletDebugVars = Partial<{
    // Build vars
    // See https://github.com/vitessio/vitess/blob/main/go/vt/servenv/buildinfo.go
    BuildGitBranch: string;
    BuildGitRev: string;
    BuildHost: string;
    BuildInformation: { [k: string]: number | string };
    BuildNumber: string;
    BuildTimestamp: string;
    BuildUser: string;

    QPS: { [k: string]: number[] };

    // See https://github.com/vitessio/vitess/blob/main/go/vt/vttablet/tabletmanager/vreplication/stats.go
    VReplicationQPS: number[];
}>;

/**
 * TABLET_TYPES maps numeric tablet types back to human readable strings.
 * Note that topodata.TabletType allows duplicate values: specifically,
 * both RDONLY (new name) and BATCH (old name) share the same numeric value.
 * So, we make the assumption that if there are duplicate keys, we will
 * always take the first value.
 */
export const TABLET_TYPES = Object.entries(invertBy(topodata.TabletType)).reduce((acc, [k, vs]) => {
    acc[k] = vs[0];
    return acc;
}, {} as { [k: string]: string });

/**
 * formatAlias formats a tablet.alias object as a single string, The Vitess Way™.
 */
export const formatAlias = <A extends topodata.ITabletAlias>(alias: A | null | undefined) =>
    alias?.uid ? `${alias.cell}-${alias.uid}` : null;

export const formatType = (t: pb.Tablet) => t.tablet?.type && TABLET_TYPES[t.tablet?.type];

export const formatDisplayType = (t: pb.Tablet) => {
    const tt = formatType(t);
    return tt === 'MASTER' ? 'PRIMARY' : tt;
};

export const SERVING_STATES = Object.keys(pb.Tablet.ServingState);

export const formatState = (t: pb.Tablet) => t.state && SERVING_STATES[t.state];
