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
import * as React from 'react';

import { useTablets } from '../../hooks/api';
import { ComboBox } from '../lib/ComboBox';
import { TabletList } from '../TabletList';
import style from './Tablets.module.scss';

export const Tablets = () => {
    const { data = [], error, isError, isSuccess } = useTablets();

    // Placeholder UI :D
    let content = <div>Loading...</div>;
    if (isError) {
        content = (
            <div>
                {error?.name}: {error?.message}
            </div>
        );
    } else if (isSuccess) {
        content = <TabletList tablets={data || []} />;
    }

    const clusterNames = data.map((t) => t.cluster?.name) as string[];
    console.log(clusterNames);

    return (
        <div>
            <h1>Tablets</h1>
            <div className={style.filterContainer}>
                <ComboBox items={clusterNames} placeholder="Cluster" />
                <ComboBox placeholder="Cell" />
                <ComboBox placeholder="Keyspace" />
                <ComboBox placeholder="Shard" />
                <ComboBox placeholder="Serving State" />
                <ComboBox placeholder="TabletType" />
            </div>
            {content}
        </div>
    );
};
