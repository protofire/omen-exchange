import axios from 'axios'
import { useCallback, useEffect, useState } from 'react'

import { getGraphUris } from '../util/networks'

import { useConnectedWeb3Context } from './connectedWeb3'

type GraphVariables = { [key: string]: string }
const fetchQuery = (query: string, variables: GraphVariables, endpoint: string) => {
  return axios.post(endpoint, { query, variables })
}

export const useMultipleQueries = <T,>(queries: string[], variables: GraphVariables): T[] => {
  const { networkId } = useConnectedWeb3Context()
  const [queriesResult, setQueriesResult] = useState<T[]>([])

  const { httpUri } = getGraphUris(networkId)
  const fetchQueries = useCallback(async () => {
    const response = await Promise.all(queries.map(q => fetchQuery(q, variables, httpUri)))
    setQueriesResult(response.filter(d => d && d.data).map(d => d.data))
  }, [httpUri, queries, variables])
  useEffect(() => {
    fetchQueries()
  }, [fetchQueries])

  return queriesResult
}
