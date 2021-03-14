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

interface Props {
    cell?: string | null | undefined;
    hostname?: string | null | undefined;
    uid?: number | string | null | undefined;
}

export const TabletLink: React.FunctionComponent<Props> = ({ cell, children, hostname, uid }) => {
    if (!cell || !uid) return null;
    if (!process.env.REACT_APP_TABLET_LINK_TEMPLATE || !hostname) {
        return <span>{children}</span>;
    }

    const href = process.env.REACT_APP_TABLET_LINK_TEMPLATE.replace('{{hostname}}', hostname);
    return (
        <a
            className="link-external"
            href={href}
            onClick={(e) => e.stopPropagation()}
            target="_blank"
            rel="noopen noreferrer"
        >
            {children}
        </a>
    );
};
