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
import { useParams } from 'react-router-dom';

import { useWorkflow } from '../../../hooks/api';
import style from './WorkflowStreams.module.scss';

interface Props {
    clusterID: string;
    keyspace: string;
    name: string;
}

export const WorkflowStreams = ({ clusterID, keyspace, name }: Props) => {
    const { data } = useWorkflow({ clusterID, keyspace, name });

    return <div>TODO</div>;
};
