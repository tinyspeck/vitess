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
import { Link, LinkProps } from 'react-router-dom';
import { RouteParams } from './Keyspace';

// This should match RouteParams in Keyspace.tsx; however, TypeScript does not
interface KeyspaceLinkProps extends Omit<LinkProps, 'to'>, RouteParams {}

export const KeyspaceLink: React.FunctionComponent<KeyspaceLinkProps> = ({
    children,
    clusterID,
    name,
    ...linkProps
}) => {
    if (!clusterID || !name) {
        console.warn('KeyspaceLink ');
    }

    return (
        <Link {...linkProps} to={`/keyspace/${clusterID}/${name}`}>
            {children}
        </Link>
    );
};
