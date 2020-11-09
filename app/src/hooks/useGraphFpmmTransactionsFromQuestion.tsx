import { useQuery } from '@apollo/react-hooks'
import gql from 'graphql-tag'
import { useEffect, useState } from 'react'

import { Status } from '../util/types'

const fragment = gql`
  fragment TransactionFields on FpmmTransaction {
    id
    user {
      id
    }
    transactionType
    collateralAmount
    collateralTokenAddress
    collateralTokenAmount
    creationTimestamp
  }
`
const withTransactionType = gql`
  query fpmmTransactions($id: ID!, $pageSize: Int, $pageIndex: Int, $transactionType: String) {
    fpmmTransactions(
      where: { fpmm: $id, transactionType: $transactionType }
      first: $pageSize
      skip: $pageIndex
      orderBy: creationTimestamp
    ) {
      ...TransactionFields
    }
  }
  ${fragment}
`
const withoutTransactionType = gql`
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
  creationTimestamp: string
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
  collateralAmountUSD: string
  creationTimestamp: string
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
      transactionType: trade.transactionType,
      user: trade.user.id,
      collateralAmountUSD: trade.collateralAmountUSD,
      collateralAmount: trade.collateralAmount,
      collateralTokenAddress: trade.collateralTokenAddress,
      creationTimestamp: 1000 * parseInt(trade.creationTimestamp),
      collateralTokenAmount: trade.collateralTokenAmount,
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

  const { data, error, loading } = useQuery(type === 0 ? withoutTransactionType : withTransactionType, {
    notifyOnNetworkStatusChange: true,
    skip: false,
    variables: {
      id: questionID,
      pageSize: pageSize,
      pageIndex: pageIndex,
      transactionType: type === 1 ? 'Sell' : 'Add',
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
