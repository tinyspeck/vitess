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
import { formatStreamKey, getStreams } from '../../../util/workflows';
import { WorkspaceSidebarHeader } from '../../layout/WorkspaceSidebarHeader';

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
        <div>
            <WorkspaceSidebarHeader onClose={onClose} title={streamKey}></WorkspaceSidebarHeader>

            <div className={style.content}>{JSON.stringify(stream, null, 2)}</div>
        </div>
    );
};
