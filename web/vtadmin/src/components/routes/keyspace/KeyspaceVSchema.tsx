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
import { useVSchema } from '../../../hooks/api';
import { Code } from '../../Code';

interface Props {
    clusterID: string;
    name: string;
}

export const KeyspaceVSchema = ({ clusterID, name }: Props) => {
    const { data: vschema, ...vq } = useVSchema({ clusterID, keyspace: name });

    return <div>{vq.isLoading ? 'Loading' : <Code code={JSON.stringify(vschema, null, 2)} />}</div>;
};
