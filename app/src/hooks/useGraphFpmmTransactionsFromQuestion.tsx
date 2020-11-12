import { useQuery } from '@apollo/react-hooks'
import gql from 'graphql-tag'
import { useEffect, useState } from 'react'

import { Status } from '../util/types'

import { useTokens } from './useTokens'

const fragment = gql`
  fragment TransactionFields on FpmmTransaction {
    id
    user {
      id
    }
    transactionType
    collateralAmount
    collateralTokenAddress
    collateralAmountUSD
    collateralTokenAmount
    creationTimestamp
    transactionHash
    fpmmType
  }
`
const withFpmmType = gql`
  query fpmmTransactions($id: ID!, $pageSize: Int, $pageIndex: Int, $fpmmType: String) {
    fpmmTransactions(
      where: { fpmm: $id, fpmmType: $fpmmType }
      first: $pageSize
      skip: $pageIndex
      orderBy: creationTimestamp
    ) {
      ...TransactionFields
    }
  }
  ${fragment}
`
const withoutFpmmType = gql`
  query fpmmTransactions($id: ID!, $pageSize: Int, $pageIndex: Int) {
    fpmmTransactions(where: { fpmm: $id }, first: $pageSize, skip: $pageIndex, orderBy: creationTimestamp) {
      ...TransactionFields
    }
  }
  ${fragment}
`
export type FpmmTradeDataType = {
  id: string
  transactionType: string
  user: {
    id: string
  }
  collateralAmount: string
  collateralTokenAddress: string
  collateralTokenAmount: string
  collateralAmountUSD: number
  creationTimestamp: string
  transactionHash: string
  fpmmType: string
}
interface FpmmTradeData {
  id: string
  transactionType: string
  user: {
    id: string
  }
  collateralAmount: string
  collateralTokenAddress: string
  collateralTokenAmount: string
  collateralAmountUSD: number
  creationTimestamp: string
  transactionHash: string
  fpmmType: string
}

interface Result {
  fpmmTrade: FpmmTradeData[] | null
  status: string
  paginationNext: boolean
}

const wrangleResponse = (data: any) => {
  return data.map((trade: FpmmTradeData) => {
    return {
      id: trade.id,
      transactionType:
        trade.transactionType === 'Add'
          ? 'Deposit'
          : trade.transactionType === 'Remove'
          ? 'Withdraw'
          : trade.transactionType,
      user: trade.user.id,
      collateralAmountUSD: Number(trade.collateralAmountUSD).toFixed(2),
      collateralAmount: trade.collateralAmount,
      collateralTokenAddress: trade.collateralTokenAddress,
      creationTimestamp: 1000 * parseInt(trade.creationTimestamp),
      collateralTokenAmount: Number(trade.collateralTokenAmount),
      transactionHash: trade.transactionHash,
    }
  })
}

export const useGraphFpmmTransactionsFromQuestion = (
  questionID: string,
  pageSize: number,
  pageIndex: number,
  type: number,
): Result => {
  const [fpmmTradeData, setFpmmTradeData] = useState<Maybe<FpmmTradeData[]>>(null)
  const [morePagination, setMorePagination] = useState<boolean>(false)

  const { data, error, loading } = useQuery(type === 0 ? withoutFpmmType : withFpmmType, {
    notifyOnNetworkStatusChange: true,
    skip: false,
    variables: {
      id: questionID,
      pageSize: pageSize,
      pageIndex: pageIndex,
      fpmmType: type === 1 ? 'Liquidity' : 'Trade',
    },
    onCompleted: ({ fpmmTransactions }: any) => {
      setMorePagination(fpmmTransactions.length === pageSize)
      setFpmmTradeData(wrangleResponse(fpmmTransactions))
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
