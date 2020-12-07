import { QueryObserverResult, useQueries, useQuery } from "react-query";

import { VRepStream } from '../types';

type ClustersPayload = string[];
export const useClusters = (config?: any) => {
	return useQuery<ClustersPayload, Error>('clusters', async () => {
        const result = await fetch('http://localhost:8090/clusters');
        return await result.json();
	}, config)
}

export const useVRepStreams = (params: { clusters: string[] }, config?: any): { 
    data: VRepStream[], 
    anyLoading: boolean,
    queries: QueryObserverResult<any, any>[],
} => {
    const queries = useQueries(params.clusters.map(c => ({
        queryKey: ['streams', c],
        queryFn: async () => {
            const cr = await fetch(`http://localhost:8090/vrep/streams?cluster=${c}`);
            const cj = await cr.json();
            return cj as VRepStream[]
        }
    })))

    const anyLoading = queries.some(q => q.isLoading)
    const data = queries.reduce((acc, { data }) => {
        acc = acc.concat((data as VRepStream[]) || [])
        return acc
    }, [] as VRepStream[])

    return { data, anyLoading, queries }
}

export const useVRepStream = (params: { cluster: string, id: number | string }) => {
	return useQuery(['stream', params], async (context) => {
        console.log(context)
        const result = await fetch(`http://localhost:8090/vrep/stream?cluster=${params.cluster}&id=${params.id}`);
        return (await result.json()) as string[];
    });
}
