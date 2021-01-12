import { useQuery } from '@apollo/react-hooks'
import { bigNumberify } from 'ethers/utils'
import gql from 'graphql-tag'
import { useEffect, useState } from 'react'

import { isObjectEqual, waitABit } from '../util/tools'
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
  fetchData: () => Promise<void>
  trades: Maybe<TradeObject[]>
  status: Status
}

let needRefetch = false

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
  const [trades, setTrades] = useState<Maybe<TradeObject[]>>(null)
  const [needUpdate, setNeedUpdate] = useState<boolean>(false)

  const { data, error, loading, refetch } = useQuery<GraphResponse>(query, {
    notifyOnNetworkStatusChange: true,
    skip: false,
    variables: { title: title, collateral: collateral, account: account },
  })

  useEffect(() => {
    setNeedUpdate(true)
  }, [title, collateral, account])

  useEffect(() => {
    if (!title || !collateral || !account) {
      setTrades([])
    }
  }, [title, collateral, account])

  if (data && data.fpmmTrades) {
    const wrangledValue = wrangleResponse(data.fpmmTrades)
    if (needUpdate) {
      setTrades(wrangledValue)
      setNeedUpdate(false)
    } else if (!isObjectEqual(trades, wrangledValue)) {
      setTrades(wrangledValue)
      needRefetch = false
    }
  }

  const fetchData = async () => {
    needRefetch = true
    let counter = 0
    await waitABit()
    while (needRefetch && counter < 15) {
      await refetch()
      await waitABit()
      counter += 1
    }
  }

  return {
    fetchData,
    trades: error ? null : trades,
    status: error ? Status.Error : loading ? Status.Loading : Status.Ready,
  }
}
