import { useLazyQuery, useQuery } from '@apollo/react-hooks'
import { DocumentNode } from 'graphql'
import gql from 'graphql-tag'
import { useEffect, useState } from 'react'

import { buildQueryMarkets, buildQueryMyMarkets } from '../queries/markets_home'

import { GraphResponseMarkets, GraphResponseMarketsGeneric, GraphResponseMyMarkets } from './useMarkets'

const getIds = (data: any): string[] => {
  const result = data.account ? data.account.fpmmParticipations.map((fpmm: any) => fpmm.fixedProductMarketMakers) : []
  return result.map((i: any) => i.id)
}

const NULL_QUERY = gql`
  query {
    accounts {
      id
    }
  }
`

export const useWrangleMarkets = (marketsOrAccounts: any, fetchMyMarkets: boolean) => {
  const [query, setQuery] = useState<DocumentNode>(NULL_QUERY)
  const { data, error, loading } = useQuery<any>(query)

  useEffect(() => {
    const ids = fetchMyMarkets && marketsOrAccounts ? getIds(marketsOrAccounts) : []
    if (fetchMyMarkets && ids.length > 0) {
      setQuery(buildQueryMyMarkets(ids))
    }
  }, [fetchMyMarkets, marketsOrAccounts])

  const result = fetchMyMarkets ? data : marketsOrAccounts
  return { data: result, loading, error }
}
