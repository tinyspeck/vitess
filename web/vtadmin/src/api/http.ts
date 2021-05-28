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

import * as errorHandler from '../util/errorHandler';
import { vtadmin as pb } from '../proto/vtadmin';
import { HttpFetchError, HttpOkResponse, HttpResponseNotOkError, MalformedHttpResponseError } from './httpTypes';

// vtfetch makes HTTP requests against the given vtadmin-api endpoint
// and returns the parsed response.
//
// HttpResponse envelope types are not defined in vtadmin.proto (nor should they be)
// thus we have to validate the shape of the API response with more care.
//
// Note that this only validates the HttpResponse envelope; it does not
// do any type checking or validation on the result.
export const vtfetch = async (endpoint: string): Promise<HttpOkResponse> => {
    try {
        const { REACT_APP_VTADMIN_API_ADDRESS } = process.env;

        const url = `${REACT_APP_VTADMIN_API_ADDRESS}${endpoint}`;
        const opts = vtfetchOpts();

        try {
            var response = await global.fetch(url, opts);
        } catch (error) {
            // Capture fetch() promise rejections and rethrow as HttpFetchError.
            // fetch() promises will reject with a TypeError when a network error is
            // encountered or CORS is misconfigured.
            // See https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch#checking_that_the_fetch_was_successful
            throw new HttpFetchError(url);
        }

        // @ts-ignore
        const json = await response.json();

        if (!('ok' in json)) throw new MalformedHttpResponseError('invalid http envelope', json);

        // Throw "not ok" responses so that react-query correctly interprets them as errors.
        // See https://react-query.tanstack.com/guides/query-functions#handling-and-throwing-errors
        if (!json.ok) {
            throw new HttpResponseNotOkError(endpoint, json, response);
        }

        return json as HttpOkResponse;
    } catch (error) {
        // Capture all errors, notify configured monitoring services,
        // and re-throw the error so downstream callers (e.g., react-query)
        // can handle it.
        errorHandler.notify(error);
        throw error;
    }
};

export const vtfetchOpts = (): RequestInit => {
    const credentials = process.env.REACT_APP_FETCH_CREDENTIALS;
    if (credentials && credentials !== 'omit' && credentials !== 'same-origin' && credentials !== 'include') {
        throw Error(
            `Invalid fetch credentials property: ${credentials}. Must be undefined or one of omit, same-origin, include`
        );
    }
    return { credentials };
};

// vtfetchEntities is a helper function for querying vtadmin-api endpoints
// that return a list of protobuf entities.
export const vtfetchEntities = async <T>(opts: {
    endpoint: string;
    // Extract the list of entities from the response. We can't (strictly)
    // guarantee type safety for API responses, hence the `any` return type.
    extract: (res: HttpOkResponse) => any;
    // Transform an individual entity in the array to its (proto)typed form.
    // This will almost always be a `.verify` followed by a `.create`,
    // but because of how protobufjs structures its generated types,
    // writing this in a generic way is... unpleasant, and difficult to read.
    transform: (e: object) => T;
}): Promise<T[]> => {
    const res = await vtfetch(opts.endpoint);

    const entities = opts.extract(res);
    if (!Array.isArray(entities)) {
        throw Error(`expected entities to be an array, got ${entities}`);
    }

    return entities.map(opts.transform);
};

export const fetchClusters = async () =>
    vtfetchEntities({
        endpoint: '/api/clusters',
        extract: (res) => res.result.clusters,
        transform: (e) => {
            const err = pb.Cluster.verify(e);
            if (err) throw Error(err);
            return pb.Cluster.create(e);
        },
    });

export const fetchGates = async () =>
    vtfetchEntities({
        endpoint: '/api/gates',
        extract: (res) => res.result.gates,
        transform: (e) => {
            const err = pb.VTGate.verify(e);
            if (err) throw Error(err);
            return pb.VTGate.create(e);
        },
    });

export const fetchKeyspaces = async () =>
    vtfetchEntities({
        endpoint: '/api/keyspaces',
        extract: (res) => res.result.keyspaces,
        transform: (e) => {
            const err = pb.Keyspace.verify(e);
            if (err) throw Error(err);
            return pb.Keyspace.create(e);
        },
    });

export const fetchSchemas = async () =>
    vtfetchEntities({
        endpoint: '/api/schemas',
        extract: (res) => res.result.schemas,
        transform: (e) => {
            const err = pb.Schema.verify(e);
            if (err) throw Error(err);
            return pb.Schema.create(e);
        },
    });

export interface FetchSchemaParams {
    clusterID: string;
    keyspace: string;
    table: string;
}

export const fetchSchema = async ({ clusterID, keyspace, table }: FetchSchemaParams) => {
    const { result } = await vtfetch(`/api/schema/${clusterID}/${keyspace}/${table}`);

    const err = pb.Schema.verify(result);
    if (err) throw Error(err);

    return pb.Schema.create(result);
};

export interface FetchTabletParams {
    clusterID: string;
    alias: string;
}

export const fetchTablet = async ({ clusterID, alias }: FetchTabletParams) => {
    const { result } = await vtfetch(`/api/tablet/${alias}?cluster=${clusterID}`);

    const err = pb.Tablet.verify(result);
    if (err) throw Error(err);

    return pb.Tablet.create(result);
};

export const fetchExperimentalTabletDebugVars = async ({ clusterID, alias }: FetchTabletParams) => {
    if (!process.env.REACT_APP_ENABLE_EXPERIMENTAL_TABLET_DEBUG_VARS) {
        return Promise.resolve({});
    }

    const { result } = await vtfetch(`/api/experimental/tablet/${alias}/debug/vars?cluster=${clusterID}`);
    return result;
};

export const fetchTablets = async () =>
    vtfetchEntities({
        endpoint: '/api/tablets',
        extract: (res) => res.result.tablets,
        transform: (e) => {
            const err = pb.Tablet.verify(e);
            if (err) throw Error(err);
            return pb.Tablet.create(e);
        },
    });
export interface FetchVSchemaParams {
    clusterID: string;
    keyspace: string;
}

export const fetchVSchema = async ({ clusterID, keyspace }: FetchVSchemaParams) => {
    const { result } = await vtfetch(`/api/vschema/${clusterID}/${keyspace}`);

    const err = pb.VSchema.verify(result);
    if (err) throw Error(err);

    return pb.VSchema.create(result);
};

export const fetchWorkflows = async () => {
    const { result } = await vtfetch(`/api/workflows`);

    const err = pb.GetWorkflowsResponse.verify(result);
    if (err) throw Error(err);

    return pb.GetWorkflowsResponse.create(result);
};

export const fetchWorkflow = async (params: { clusterID: string; keyspace: string; name: string }) => {
    const { result } = await vtfetch(`/api/workflow/${params.clusterID}/${params.keyspace}/${params.name}`);

    const err = pb.Workflow.verify(result);
    if (err) throw Error(err);

    return pb.Workflow.create(result);
};

export const fetchVTExplain = async <R extends pb.IVTExplainRequest>({ cluster, keyspace, sql }: R) => {
    // As an easy enhancement for later, we can also validate the request parameters on the front-end
    // instead of defaulting to '', to save a round trip.
    const req = new URLSearchParams();
    req.append('cluster', cluster || '');
    req.append('keyspace', keyspace || '');
    req.append('sql', sql || '');

    const { result } = await vtfetch(`/api/vtexplain?${req}`);

    const err = pb.VTExplainResponse.verify(result);
    if (err) throw Error(err);

    return pb.VTExplainResponse.create(result);
};
