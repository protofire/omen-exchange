import { useQuery } from '@apollo/react-hooks'
import gql from 'graphql-tag'
import { useEffect, useState } from 'react'

import { Status } from '../util/types'

const query = gql`
  query fpmmTrades($id: ID!) {
    fpmmTrades(where: { fpmm: $id }, first: 6, orderBy: creationTimestamp) {
      id
      creator {
        id
      }
      type
      outcomeTokensTraded
      collateralAmount
      collateralAmountUSD
      creationTimestamp
    }
  }
`
export type FpmmTradeDataType = {
  collateralAmount: string
  collateralAmountUSD: string
  creationTimestamp: string
  creator: {
    id: string
  }
  id: string
  outcomeTokensTraded: string
  type: string
}
interface FpmmTradeData {
  collateralAmount: string
  collateralAmountUSD: string
  creationTimestamp: string
  creator: {
    id: string
  }
  id: string
  outcomeTokensTraded: string
  type: string
}

interface Result {
  fpmmTrade: FpmmTradeData[] | null
  status: string
}
const wrangleResponse = (data: any) => {
  return data.map((trade: FpmmTradeData) => {
    return {
      collateralAmount: trade.collateralAmount,
      collateralAmountUSD: Number(trade.collateralAmountUSD).toFixed(2),
      creationTimestamp: 1000 * parseInt(trade.creationTimestamp),
      creator: trade.creator.id,
      id: trade.id,
      outcomeTokensTraded: trade.outcomeTokensTraded,
      type: trade.type,
    }
  })
}

export const useGraphFpmmTradesFromQuestion = (questionID: string): Result => {
  const [fpmmTradeData, setFpmmTradeData] = useState<Maybe<FpmmTradeData[]>>(null)
  console.log('inside the gargantua')
  const { data, error, loading } = useQuery(query, {
    notifyOnNetworkStatusChange: true,
    skip: false,
    variables: { id: questionID },
  })

  useEffect(() => {
    setFpmmTradeData(null)
  }, [questionID])

  if (data && data.fpmmTrades && fpmmTradeData === null) {
    setFpmmTradeData(wrangleResponse(data.fpmmTrades))
  }

  return {
    fpmmTrade: error ? null : fpmmTradeData,
    status: error ? Status.Error : loading ? Status.Loading : Status.Ready,
  }
}
