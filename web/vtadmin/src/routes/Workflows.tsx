import * as React from 'react';
import { useQuery } from 'react-query';

import style from './Workflows.module.scss'
import { VRepStreamList } from '../components/VRepStreamList';
import { VRepStream } from '../types';
import { Spinner } from '../components/Spinner';

export const Workflows = () => {
	const clustersQuery = useQuery('clusters', async () => {
		const result = await fetch('http://localhost:8090/clusters')
		return await result.json() as string[]
	})
	const clusters = clustersQuery.data || []

	// See https://github.com/tannerlinsley/react-query/discussions/990
	const streamQuery = useQuery(['streams', { clusters }], async (queryKey, { clusters }) => {
		let result: VRepStream[] = []
		for (let i = 0; i < clusters.length; i++) {
			const cluster = clusters[i]
			const cr = await fetch(`http://localhost:8090/vrep/streams?cluster=${cluster}`)
			const cj = await cr.json()
			result = result.concat(cj)
		}
		return result
	}, {
		enabled: clusters,
	})
	const streams = streamQuery.data || []
	const isLoading = clustersQuery.isLoading || streamQuery.isLoading

	return (
		<div>
			<header className={style.header}>
				<h1>Workflows</h1>
				<div className={style.spinner}>
					{isLoading && <Spinner /> }
				</div>
			</header>
			<VRepStreamList streams={streams} />
		</div>
	)
}
