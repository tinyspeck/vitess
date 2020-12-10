import * as pb from '../proto/compiled'

export const fetchVRepStream = async (params: { cluster: string, id: number | string }) => {
	const result = await fetch(`http://localhost:8090/vrep/stream?cluster=${params.cluster}&id=${params.id}`);
	const rj = await result.json()
	const pvs = pb.vreplication.VRepStream.create(rj)
	return pvs
}
