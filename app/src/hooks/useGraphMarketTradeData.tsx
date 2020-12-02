import { useQuery } from '@apollo/react-hooks'
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

type GraphResponse = {
  fpmmTrades: Maybe<TradeObject[]>
}

type Result = {
  trades: TradeObject[]
  status: Status
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
    trades = data.fpmmTrades
  } else if (data && data.fpmmTrades && !data.fpmmTrades.length) {
    trades = []
  }

  return {
    trades,
    status: error ? Status.Error : loading ? Status.Loading : Status.Ready,
  }
}
