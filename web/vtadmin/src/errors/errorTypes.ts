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

/**
 * ErrorHandler defines a common interface for bindings to
 * client-side monitoring services.
 * 
 * Similar to Vitess itself [1], vtadmin-web can integrate with a variety
 * of client-side monitoring tools. At the time of this writing, only
 * Bugsnag integration is added. This interface, however, allows flexibility
 * to implement other monitoring serivces, like Sentry, Datadog, etc.
 *
 * [1] https://vitess.io/docs/user-guides/configuration-basic/monitoring/
 */
export interface ErrorHandler {
    /**
     * Handler to initialize the monitoring client. Called at the very
     * beginning of the app life cycle. If a particular client supports
     * capturing unhandled exceptions (as most do) that initialization
     * logic should happen here.
     */
    initialize: () => void;

    /**
     * Handler to determine whether the monitoring client is enabled.
     */
    isEnabled: () => boolean;

    /**
     * Handler to manually notify the monitoring system of a problem.
     * 
     * @param error - The Error that was thrown
     * @param env - Sanitized process.env environment variables
     * @param metadata - Additional, arbitrary metadata.
     */
    notify: (error: Error, env: object, metadata?: object) => void;
}


export interface HttpOkResponse {
    ok: true;
    result: any;
}

export interface HttpErrorResponse {
    ok: false;
}

export const MALFORMED_HTTP_RESPONSE_ERROR = 'MalformedHttpResponseError';

// MalformedHttpResponseError is thrown when the JSON response envelope
// is an unexpected shape.
export class MalformedHttpResponseError extends Error {
    responseJson: object;

    constructor(message: string, responseJson: object) {
        super(message);
        this.name = MALFORMED_HTTP_RESPONSE_ERROR;
        this.responseJson = responseJson;
    }
}

export const HTTP_RESPONSE_NOT_OK_ERROR = 'HttpResponseNotOkError';

// HttpResponseNotOkError is throw when the `ok` is false in
// the JSON response envelope.
export class HttpResponseNotOkError extends Error {
    response: HttpErrorResponse | null;

    constructor(endpoint: string, response: HttpErrorResponse) {
        super(endpoint);
        this.name = HTTP_RESPONSE_NOT_OK_ERROR;
        this.response = response;
    }
}

export const HTTP_FETCH_ERROR = 'HttpFetchError';

// HttpFetchError is thrown when fetch() promises reject with a TypeError when a network error is
// encountered or CORS is misconfigured.
//
// See https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch#checking_that_the_fetch_was_successful
export class HttpFetchError extends Error {
    constructor(endpoint: string) {
        super(endpoint);
        this.name = HTTP_FETCH_ERROR;
    }
}
