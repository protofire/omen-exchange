import { useQuery } from '@apollo/react-hooks'
import gql from 'graphql-tag'
import { useEffect, useState } from 'react'

import { Status } from '../util/types'

const query = gql`
  query GetQuestion($id: ID!) {
    question(id: $id) {
      indexedFixedProductMarketMakers {
        id
      }
    }
  }
`

type GraphResponseMarketIdMaker = {
  indexedFixedProductMarketMakers: [
    {
      id: string
    },
  ]
}

type GraphResponse = {
  question: Maybe<GraphResponseMarketIdMaker>
}

type Result = {
  marketId: Maybe<string>
  status: Status
}

/**
 * Get data from the graph for the given market maker. All the information returned by this hook comes from the graph,
 * other necessary information should be fetched from the blockchain.
 */
export const useGraphMarketIdFromQuestion = (questionId: string): Result => {
  const [marketId, setMarketId] = useState<Maybe<string>>('')

  const { data, error, loading } = useQuery<GraphResponse>(query, {
    notifyOnNetworkStatusChange: true,
    skip: false,
    variables: { id: questionId },
  })

  useEffect(() => {
    if (!questionId) setMarketId('')
  }, [questionId])

  if (data && data.question && data.question.indexedFixedProductMarketMakers.length > 0 && !marketId) {
    setMarketId(data.question.indexedFixedProductMarketMakers[0].id)
  }

  return {
    marketId,
    status: error ? Status.Error : loading ? Status.Loading : Status.Ready,
  }
}
