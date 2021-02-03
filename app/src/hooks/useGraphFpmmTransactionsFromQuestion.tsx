import { useQuery } from '@apollo/react-hooks'
import { BigNumber } from 'ethers/utils'
import gql from 'graphql-tag'
import { useEffect, useState } from 'react'

import { Status } from '../util/types'

const fragment = gql`
  fragment TransactionFields on FpmmTransaction {
    id
    user {
      id
    }
    fpmm {
      collateralToken
    }
    fpmmType
    transactionType
    collateralTokenAmount
    sharesOrPoolTokenAmount
    creationTimestamp
    transactionHash
    additionalSharesCost
  }
`
const withFpmmType = gql`
  query fpmmTransactions($id: ID!, $pageSize: Int, $pageIndex: Int, $fpmmType: String) {
    fpmmTransactions(
      where: { fpmm: $id, fpmmType: $fpmmType }
      first: $pageSize
      skip: $pageIndex
      orderBy: creationTimestamp
      orderDirection: desc
    ) {
      ...TransactionFields
    }
  }
  ${fragment}
`
const withoutFpmmType = gql`
  query fpmmTransactions($id: ID!, $pageSize: Int, $pageIndex: Int) {
    fpmmTransactions(
      where: { fpmm: $id }
      first: $pageSize
      skip: $pageIndex
      orderBy: creationTimestamp
      orderDirection: desc
    ) {
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
  fpmm: {
    collateralToken: string
  }
  collateralTokenAddress: string
  sharesOrPoolTokenAmount: BigNumber
  collateralTokenAmount: BigNumber
  creationTimestamp: number
  transactionHash: string
  fpmmType: string
  decimals: number
}

export enum HistoryType {
  All,
  Liquidity,
  Trades,
}
interface FpmmTradeData {
  id: string
  transactionType: string
  user: {
    id: string
  }
  fpmm: {
    collateralToken: string
  }
  collateralTokenAddress: string
  sharesOrPoolTokenAmount: BigNumber
  collateralTokenAmount: BigNumber
  creationTimestamp: number
  transactionHash: string
  fpmmType: string
  decimals: number
  additionalSharesCost: BigNumber
}

interface Result {
  fpmmTransactions: FpmmTradeData[] | null
  status: string
  paginationNext: boolean
  refetch: any
}
const wrangleResponse = (data: any, decimals: number) => {
  return data.map((trade: FpmmTradeData) => {
    return {
      id: trade.id,
      transactionType:
        trade.transactionType === 'Add'
          ? 'Deposit'
          : trade.transactionType === 'Remove'
          ? 'Withdraw'
          : trade.transactionType,
      user: {
        id: trade.user.id,
      },
      fpmmType: trade.fpmmType,
      decimals: decimals,
      collateralTokenAddress: trade.fpmm.collateralToken,
      sharesOrPoolTokenAmount: trade.sharesOrPoolTokenAmount,
      creationTimestamp: 1000 * trade.creationTimestamp,
      collateralTokenAmount: trade.collateralTokenAmount,
      transactionHash: trade.transactionHash,
      additionalSharesCost: trade.additionalSharesCost,
    }
  })
}

export const useGraphFpmmTransactionsFromQuestion = (
  questionID: string,
  pageSize: number,
  pageIndex: number,
  type: HistoryType,
  decimals: number,
): Result => {
  const [fpmmTradeData, setFpmmTradeData] = useState<Maybe<FpmmTradeData[]>>(null)
  const [morePagination, setMorePagination] = useState<boolean>(true)

  const { data, error, loading, refetch } = useQuery(type === HistoryType.All ? withoutFpmmType : withFpmmType, {
    notifyOnNetworkStatusChange: true,
    skip: false,
    variables: {
      id: questionID,
      pageSize: pageSize + 1,
      pageIndex: pageIndex,
      fpmmType: type === HistoryType.All || type === HistoryType.Liquidity ? 'Liquidity' : 'Trade',
    },
    onCompleted: ({ fpmmTransactions }: any) => {
      let internalArray = fpmmTransactions

      setMorePagination(internalArray.length === pageSize + 1)
      if (internalArray.length === pageSize + 1) {
        internalArray = internalArray.slice(0, pageSize)
      }
      setFpmmTradeData(wrangleResponse(internalArray, decimals))
    },
  })

  useEffect(() => {
    setFpmmTradeData(null)
  }, [questionID, type])

  if (data && data.fpmmTrades && fpmmTradeData === null) {
    setFpmmTradeData(wrangleResponse(data.fpmmTrades, decimals))
  }

  return {
    paginationNext: morePagination,
    fpmmTransactions: error ? null : fpmmTradeData,
    status: error ? Status.Error : loading ? Status.Loading : Status.Ready,
    refetch,
  }
}
