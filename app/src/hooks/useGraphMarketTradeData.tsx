import { useQuery } from '@apollo/react-hooks'
import { BigNumber, bigNumberify } from 'ethers/utils'
import gql from 'graphql-tag'
import { useEffect, useState } from 'react'

import { isObjectEqual } from '../util/tools'
import { Status, TradeObject } from '../util/types'

const query = gql`
  query GetMarketTradeData($title: String!, $collateral: Bytes!, $account: String!) {
    fpmmTrades(where: { title: $title, collateralToken: $collateral, creator: $account }) {
      title
      outcomeTokensTraded
      collateralAmount
      feeAmount
      outcomeTokenMarginalPrice
      oldOutcomeTokenMarginalPrice
      type
      outcomeIndex
    }
  }
`

type GraphResponseTradeObject = {
  title: string
  outcomeTokensTraded: string
  collateralAmount: string
  feeAmount: string
  outcomeTokenMarginalPrice: string
  oldOutcomeTokenMarginalPrice: string
  type: string
  outcomeIndex: string
}

type GraphResponse = {
  fpmmTrades: Maybe<GraphResponseTradeObject[]>
}

type Result = {
  trades: TradeObject[]
  status: Status
}

const wrangleResponse = (data: GraphResponseTradeObject[]) => {
  const mappedData = data.map(datum => {
    return {
      title: datum.title,
      outcomeTokensTraded: bigNumberify(datum.outcomeTokensTraded),
      collateralAmount: bigNumberify(datum.collateralAmount),
      feeAmount: bigNumberify(datum.feeAmount),
      outcomeTokenMarginalPrice: Number(datum.outcomeTokenMarginalPrice),
      oldOutcomeTokenMarginalPrice: Number(datum.oldOutcomeTokenMarginalPrice),
      type: datum.type,
      outcomeIndex: datum.outcomeIndex,
    }
  })

  return mappedData
}

export const useGraphMarketTradeData = (title: string, collateral: string, account: string | undefined): Result => {
  let trades: TradeObject[] = []

  const { data, error, loading } = useQuery<GraphResponse>(query, {
    notifyOnNetworkStatusChange: true,
    skip: false,
    variables: { title: title, collateral: collateral, account: account },
  })

  useEffect(() => {
    if (!title || !collateral || !account) {
      trades = []
    }
  }, [title, collateral])

  if (data && data.fpmmTrades && !isObjectEqual(trades, data.fpmmTrades)) {
    trades = wrangleResponse(data.fpmmTrades)
  } else if (data && data.fpmmTrades && !data.fpmmTrades.length) {
    trades = []
  }

  return {
    trades,
    status: error ? Status.Error : loading ? Status.Loading : Status.Ready,
  }
}
