import * as React from 'react'
import { Link } from 'react-router-dom'

import { VRepStream } from '../types'

interface Props {
	streams: VRepStream[],
}

export const VRepStreamList: React.FC<Props> = ({ streams }) => {
	// FIXME any casts
	const sortedStreams = streams.sort((a: any, b: any) => b.time_updated - a.time_updated)
	return (
		<table>
			<thead>
				<tr>
					<th>State</th>
					<th>Workflow</th>
					<th>Updated at</th>
					<th>Cluster</th>
					<th>Keyspace</th>
					<th>Shard</th>
				</tr>
			</thead>
			<tbody>
			{sortedStreams.map(stream => (
				<tr key={`${stream.cluster}-${stream.id}`}>
					<td>{stream.state}</td>
					<td>
						<Link to={`/vrep/streams/${stream.cluster}/${stream.id}`}>
							{stream.workflow}
						</Link>
					</td>
					{/* FIXME */}
					<td>{new Date((stream as any).time_updated * 1000).toLocaleString()}</td>
					<td>{stream.cluster}</td>
					<td>{stream.keyspace}</td>
					<td>{stream.shard}</td>
				</tr>
			))}
			</tbody>
		</table>
	)
}
