import axios from 'axios'
import { useCallback, useEffect, useState } from 'react'

type GraphVariables = { [key: string]: string }
const fetchQuery = (query: string, variables: GraphVariables) => {
  return axios.post('https://api.thegraph.com/subgraphs/name/gnosis/omen', { query, variables })
}

export const useMultipleQueries = <T,>(queries: string[], variables: GraphVariables): T[] => {
  const [queriesResult, setQueriesResult] = useState<T[]>([])

  const fetchQueries = useCallback(async () => {
    const response = await Promise.all(queries.map(q => fetchQuery(q, variables)))
    setQueriesResult(response.filter(d => d && d.data).map(d => d.data))
  }, [queries, variables])
  useEffect(() => {
    fetchQueries()
  }, [fetchQueries])

  return queriesResult
}
