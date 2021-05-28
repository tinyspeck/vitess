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

import Bugsnag from '@bugsnag/js';

const { REACT_APP_BUGSNAG_API_KEY } = process.env;

/**
 * If using Bugsnag, this will automatically capture and report
 * unhandled exceptions and unhandled promise rejections.
 */
export const initializeErrorHandling = () => {
    if (REACT_APP_BUGSNAG_API_KEY) {
        // Starting Bugsnag
        Bugsnag.start(REACT_APP_BUGSNAG_API_KEY);
    }
};

/**
 * Manually notify the configured monitoring service(s) of a problem.
 */
export const notify = (error: Error) => {
    // See https://docs.bugsnag.com/platforms/javascript/reporting-handled-errors/
    Bugsnag.notify(error, (event) => {
        event.addMetadata('env', sanitizeEnv());

        Object.getOwnPropertyNames(error).forEach((n) => {
            if (n === 'stack' || n === 'message') {
                return;
            }

            const metadata = (error as any)[n];
            event.addMetadata(n, metadata);
        });
    });
};

const sanitizeEnv = () => ({
    REACT_APP_GIT_BRANCH: process.env.REACT_APP_GIT_BRANCH,
    REACT_APP_GIT_COMMIT: process.env.REACT_APP_GIT_COMMIT,
    REACT_APP_ENABLE_EXPERIMENTAL_TABLET_DEBUG_VARS: process.env.REACT_APP_ENABLE_EXPERIMENTAL_TABLET_DEBUG_VARS,
    REACT_APP_FETCH_CREDENTIALS: process.env.REACT_APP_FETCH_CREDENTIALS,
});
