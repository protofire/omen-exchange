import { useQuery } from '@apollo/react-hooks'
import gql from 'graphql-tag'
import { useEffect, useState } from 'react'

import { isObjectEqual } from '../util/tools'
import { Status } from '../util/types'

const query = gql`
  query GetQuestion($id: ID!) {
    question(id: $id) {
      indexedFixedProductMarketMakers {
        id
        collateralToken
      }
    }
  }
`

type MarketTokenPair = {
  id: string
  collateralToken: string
}

type GraphResponseMarketIdMaker = {
  indexedFixedProductMarketMakers: MarketTokenPair[]
}

type GraphResponse = {
  question: Maybe<GraphResponseMarketIdMaker>
}

type Result = {
  markets: MarketTokenPair[]
  status: Status
}

/**
 * Get data from the graph for the given market maker. All the information returned by this hook comes from the graph,
 * other necessary information should be fetched from the blockchain.
 */
export const useGraphMarketsFromQuestion = (questionId: string): Result => {
  const [markets, setMarkets] = useState<MarketTokenPair[]>([])

  const { data, error, loading } = useQuery<GraphResponse>(query, {
    notifyOnNetworkStatusChange: true,
    skip: false,
    variables: { id: questionId },
  })

  useEffect(() => {
    if (!questionId) setMarkets([])
    if (data && data.question && !isObjectEqual(markets, data.question.indexedFixedProductMarketMakers)) {
      setMarkets(data.question.indexedFixedProductMarketMakers)
    } else if (data && data.question && !data.question.indexedFixedProductMarketMakers.length) {
      setMarkets([])
    }
    // eslint-disable-next-line
  }, [questionId, data])

  return {
    markets,
    status: error ? Status.Error : loading ? Status.Loading : Status.Ready,
  }
}
