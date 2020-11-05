import { useQuery } from '@apollo/react-hooks'
import gql from 'graphql-tag'
import { useEffect, useState } from 'react'

import { Status } from '../util/types'

const query = gql`
  query fpmmTrades($id: ID!, $pageSize: Int, $pageIndex: Int) {
    fpmmTrades(where: { fpmm: $id }, first: $pageSize, skip: $pageIndex, orderBy: creationTimestamp) {
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
  paginationNext: boolean
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

export const useGraphFpmmTradesFromQuestion = (questionID: string, pageSize: number, pageIndex: number): Result => {
  const [fpmmTradeData, setFpmmTradeData] = useState<Maybe<FpmmTradeData[]>>(null)
  const [morePagination, setMorePagination] = useState<boolean>(false)
  const { data, error, loading } = useQuery(query, {
    notifyOnNetworkStatusChange: true,
    skip: false,
    variables: { id: questionID, pageSize: pageSize, pageIndex: pageIndex },
    onCompleted: ({ fpmmTrades }: any) => {
      setMorePagination(fpmmTrades.length === pageSize)
      setFpmmTradeData(wrangleResponse(fpmmTrades))
    },
  })

  useEffect(() => {
    setFpmmTradeData(null)
  }, [questionID])

  if (data && data.fpmmTrades && fpmmTradeData === null) {
    setFpmmTradeData(wrangleResponse(data.fpmmTrades))
  }

  return {
    paginationNext: morePagination,
    fpmmTrade: error ? null : fpmmTradeData,
    status: error ? Status.Error : loading ? Status.Loading : Status.Ready,
  }
}
