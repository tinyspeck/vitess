import { QueryConfig, useQuery } from "react-query";

import { VRepStream } from '../types';

type ClustersPayload = string[];
export const useClusters = (config?: QueryConfig<ClustersPayload, Error>) => {
	return useQuery<ClustersPayload, Error>('clusters', async () => {
        const result = await fetch('http://localhost:8090/clusters');
        return await result.json();
	}, config)
}

type VRepStreamsPayload = VRepStream[]
export const useVRepStreams = (params: { clusters: string[] }, config?: QueryConfig<VRepStreamsPayload, Error>) => {
	return useQuery(
        ['streams', params],
        async (queryKey, { clusters }) => {
			// See https://github.com/tannerlinsley/react-query/discussions/990
            let result: VRepStream[] = [];
            for (let i = 0; i < clusters.length; i++) {
                const cluster = clusters[i];
                const cr = await fetch(`http://localhost:8090/vrep/streams?cluster=${cluster}`);
                const cj = await cr.json();
                result = result.concat(cj);
            }
            return result;
		},
		config
    )
}

type VRepStreamPayload = VRepStream
export const useVRepStream = (params: { cluster: string, id: number | string }, config?: QueryConfig<VRepStreamPayload, Error>) => {
	return useQuery(['stream', params], async (queryKey, { cluster, id }) => {
        const result = await fetch(`http://localhost:8090/vrep/stream?cluster=${cluster}&id=${id}`);
        return (await result.json()) as string[];
    });
}
