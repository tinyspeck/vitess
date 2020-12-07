import { QueryObserverResult, useQueries, useQuery } from "react-query";

import { VRepStream } from '../types';

interface AggregateQueries<TD, TE> {
    anyFetching: boolean,
    anyLoading: boolean,
    data: TD,
    queries: QueryObserverResult<TD, TE>[],
}

type ClustersPayload = string[];
export const useClusters = (config?: any) => {
	return useQuery<ClustersPayload, Error>('clusters', async () => {
        const result = await fetch('http://localhost:8090/clusters');
        return await result.json();
	}, config)
}

export const useVRepStreams = (params: { clusters: string[] }, config?: any): AggregateQueries<VRepStream[], Error> => {
    const queries = useQueries(params.clusters.map(c => ({
        queryKey: ['streams', c],
        queryFn: async () => {
            const cr = await fetch(`http://localhost:8090/vrep/streams?cluster=${c}`);
            const cj = await cr.json();
            return cj as VRepStream[]
        }
    }))) as QueryObserverResult<VRepStream[], Error>[];

    const anyLoading = queries.some(q => q.isLoading)
    const anyFetching = queries.some(q => q.isFetching)

    const data = queries.reduce((acc, { data }) => {
        acc = acc.concat((data as VRepStream[]) || [])
        return acc
    }, [] as VRepStream[])

    return { data, anyFetching, anyLoading, queries }
}

export const useVRepStream = (params: { cluster: string, id: number | string }) => {
	return useQuery(['stream', params], async (context) => {
        console.log(context)
        const result = await fetch(`http://localhost:8090/vrep/stream?cluster=${params.cluster}&id=${params.id}`);
        return (await result.json()) as string[];
    });
}
