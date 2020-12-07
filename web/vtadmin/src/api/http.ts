const VTADMIN_API_HOST = 'http://localhost:8090'

export const fetchVRepStreams = (params: { clusters: string[] }) => {
	const q = new URLSearchParams();
	params.clusters.forEach((r) => q.append('cluster', r));
	const url = `${VTADMIN_API_HOST}/app/tablets?${q}`;
	return fetch
}
