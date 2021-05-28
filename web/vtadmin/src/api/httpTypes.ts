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

export interface HttpOkResponse {
    ok: true;
    result: any;
}

export interface HttpErrorResponse {
    error?: {
        message?: string;
        code?: string;
    };
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
    fetchResponse: {
        ok: boolean;
        status: number;
        statusText: string;
        type: string;
        url: string;
    };
    response: HttpErrorResponse | null;

    constructor(endpoint: string, response: HttpErrorResponse, fetchResponse: Response) {
        const key = `[status ${fetchResponse.status}] ${endpoint}: ${response.error?.code} ${response.error?.message}`;
        super(key);

        this.name = HTTP_RESPONSE_NOT_OK_ERROR;
        this.response = response;

        this.fetchResponse = {
            ok: fetchResponse.ok,
            status: fetchResponse.status,
            statusText: fetchResponse.statusText,
            type: fetchResponse.type,
            url: fetchResponse.url,
        };
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
