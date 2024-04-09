import {useEffect, useRef, useState} from 'react'
import isEqual from 'react-fast-compare'
import {catchError, distinctUntilChanged} from 'rxjs/operators'
import {ListenQueryOptions, useClient} from 'sanity'

import {listenQuery} from './fixedListenQuery'

type Params = Record<string, string | number | boolean | string[]>

type ReturnShape<T> = {
  loading: boolean
  error: boolean
  data: T | null
}

type Observable = {
  unsubscribe: () => void
}

const DEFAULT_PARAMS = {}
const DEFAULT_OPTIONS: ListenQueryOptions = {apiVersion: `v2022-05-09`}

export function useListeningQuery<T>(
  query: string,
  params: Params = DEFAULT_PARAMS,
  options: ListenQueryOptions = DEFAULT_OPTIONS,
): ReturnShape<T> {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [data, setData] = useState<T | null>(null)
  const subscription = useRef<null | Observable>(null)

  const client = useClient({apiVersion: `v2022-05-09`})

  useEffect(() => {
    if (query) {
      subscription.current = listenQuery(client, query, params, options)
        .pipe(
          distinctUntilChanged(isEqual),
          catchError((err) => {
            console.error(err)
            setError(err)
            setLoading(false)
            setData(null)

            return err
          }),
        )
        .subscribe((documents) => {
          setData((current) => (isEqual(current, documents) ? current : documents))
          setLoading(false)
          setError(false)
        })
    }

    return () => {
      return subscription.current ? subscription.current.unsubscribe() : undefined
    }
  }, [query, params, options, client])

  return {loading, error, data}
}
