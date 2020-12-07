import { useQuery } from "react-query";

import { VRepStream } from '../types';

type ClustersPayload = string[];
export const useClusters = (config?: any) => {
	return useQuery<ClustersPayload, Error>('clusters', async () => {
        const result = await fetch('http://localhost:8090/clusters');
        return await result.json();
	}, config)
}

type VRepStreamsPayload = VRepStream[]
export const useVRepStreams = (params: { clusters: string[] }, config?: any) => {
	return useQuery(
        ['streams', params],
        async (context) => {
			// See https://github.com/tannerlinsley/react-query/discussions/990
            let result: VRepStream[] = [];
            for (let i = 0; i < params.clusters.length; i++) {
                const cluster = params.clusters[i];
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
export const useVRepStream = (params: { cluster: string, id: number | string }) => {
	return useQuery(['stream', params], async (context) => {
        console.log(context)
        const result = await fetch(`http://localhost:8090/vrep/stream?cluster=${params.cluster}&id=${params.id}`);
        return (await result.json()) as string[];
    });
}
