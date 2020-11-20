import { useQuery } from '@apollo/react-hooks'
import { ethers } from 'ethers'
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
  fpmm: {
    collateralToken: string
  }
  collateralTokenAddress: string
  sharesOrPoolTokenAmount: BigNumber
  collateralTokenAmount: BigNumber
  creationTimestamp: string
  transactionHash: string
  fpmmType: string
}

interface Result {
  fpmmTrade: FpmmTradeData[] | null
  status: string
  paginationNext: boolean
  refetch: any
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
      collateralTokenAddress: trade.fpmm.collateralToken,
      sharesOrPoolTokenAmount: parseFloat(ethers.utils.formatEther(trade.sharesOrPoolTokenAmount)).toFixed(2),
      creationTimestamp: 1000 * parseInt(trade.creationTimestamp),
      collateralTokenAmount: parseFloat(ethers.utils.formatEther(trade.collateralTokenAmount)).toFixed(2),
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

  const { data, error, loading, refetch } = useQuery(type === 0 ? withoutFpmmType : withFpmmType, {
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
  }, [questionID, type])

  if (data && data.fpmmTrades && fpmmTradeData === null) {
    setFpmmTradeData(wrangleResponse(data.fpmmTrades))
  }

  return {
    paginationNext: morePagination,
    fpmmTrade: error ? null : fpmmTradeData,
    status: error ? Status.Error : loading ? Status.Loading : Status.Ready,
    refetch,
  }
}
