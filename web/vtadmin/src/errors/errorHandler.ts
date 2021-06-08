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
import * as Bugsnag from './bugsnag';
import { ErrorHandler } from './errorTypes';

const HANDLERS: ErrorHandler[] = [Bugsnag].filter((h) => h.isEnabled());

/**
 * Initializes error handling for both unhandled and handled exceptions.
 * This should be called as early as possible.
 */
export const initialize = () => {
    HANDLERS.forEach((h) => h.initialize());
};

export const notify = (error: Error, metadata?: object) => {
    const env = sanitizeEnv();
    HANDLERS.forEach((h) => h.notify(error, env, metadata));
};

/**
 * Implemented as an allow list, rather than as a block list, to avoid
 * leaking sensitive environment variables, like API keys.
 */
const sanitizeEnv = () => ({
    REACT_APP_GIT_BRANCH: process.env.REACT_APP_GIT_BRANCH,
    REACT_APP_GIT_COMMIT: process.env.REACT_APP_GIT_COMMIT,
    REACT_APP_ENABLE_EXPERIMENTAL_TABLET_DEBUG_VARS: process.env.REACT_APP_ENABLE_EXPERIMENTAL_TABLET_DEBUG_VARS,
    REACT_APP_FETCH_CREDENTIALS: process.env.REACT_APP_FETCH_CREDENTIALS,
});
