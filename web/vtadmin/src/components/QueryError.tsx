import * as React from 'react'
import { QueryObserverLoadingErrorResult, QueryObserverRefetchErrorResult } from 'react-query'

import style from './QueryError.module.scss'

interface Props<T> {
	query: QueryObserverLoadingErrorResult<T, Error> | QueryObserverRefetchErrorResult<T, Error>,
}
export const QueryError = <T,>({ children, query }: React.PropsWithChildren<Props<T>>) => {
	if (!query.isError) return null

	const onClickRetry = (e:  React.MouseEvent<HTMLButtonElement, MouseEvent>) => query.refetch()

	return (
		<div className={style.container}>
			<span className={style.emoji}>😿</span>
			
			{children}

			<div className={style.actions}>
				<button disabled={query.isFetching} onClick={onClickRetry} type="button">
					{query.isFetching ? "Retrying..." : "Retry"}
				</button>
			</div>
		</div>
	)
}
