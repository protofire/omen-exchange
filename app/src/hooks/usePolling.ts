// Taken from https://github.com/faizrr/use-api-polling and modified

import { useCallback, useState, useEffect, useRef } from 'react'

export type APIPollingOptions<T> = {
  fetchFunc: () => Promise<T>
  initialState: T
  delay: number
  onError?: (e: Error) => void
}

export function usePolling<T>(opts: APIPollingOptions<T>): T {
  const { initialState, fetchFunc, delay, onError } = opts

  const timerId = useRef<number>()
  const cancelled = useRef<boolean>(false)
  const [data, setData] = useState(initialState)

  const fetchData = useCallback(() => {
    return new Promise(resolve => {
      fetchFunc()
        .then(newData => {
          setData(newData)
          resolve()
        })
        .catch(e => {
          if (onError) {
            onError(e)
          }
          resolve()
        })
    })
  }, [fetchFunc, onError])

  const doPolling = useCallback(() => {
    if (!cancelled.current) {
      timerId.current = setTimeout(() => {
        fetchData().then(() => {
          doPolling()
        })
      }, delay)
    }
  }, [fetchData, delay])

  const stopPolling = () => {
    if (timerId.current !== undefined) {
      clearTimeout(timerId.current)
      cancelled.current = true
    }
  }

  useEffect(() => {
    fetchData().then(() => {
      doPolling()
    })

    return stopPolling
  }, [doPolling, fetchData])

  return data
}
