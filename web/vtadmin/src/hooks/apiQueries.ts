import { useQuery } from 'react-query'

import * as pb from '../proto/vtadmin'

export const useTablets = () => {
	return useQuery(['tablets'], async () => {
		const response = await fetch(`${process.env.REACT_APP_VTADMIN_API_ADDRESS}/api/tablets`)
		const js = await response.json()
		return js.result.tablets as pb.vtadmin.ITablet[]; // TODO validation
	})
}
