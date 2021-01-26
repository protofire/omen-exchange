import { useQuery } from '@apollo/react-hooks'
import { bigNumberify } from 'ethers/utils'
import gql from 'graphql-tag'
import { useEffect, useState } from 'react'

import { isObjectEqual, waitABit } from '../util/tools'
import { LiquidityObject, Status, TradeObject } from '../util/types'

const tradeQuery = gql`
  query GetMarketTradeData($marketAddress: String!, $cpkAddress: String!) {
    fpmmTrades(where: { fpmm: $marketAddress, creator: $cpkAddress }) {
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

const liquidityQuery = gql`
  query GetMarketLiquidityData($marketAddress: String!, $cpkAddress: String!) {
    fpmmLiquidities(where: { fpmm: $marketAddress, funder: $cpkAddress }) {
      type
      additionalSharesCost
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

type GraphResponseLiquidityObject = {
  type: string
  additionalSharesCost: string
}

type TradeGraphResponse = {
  fpmmTrades: Maybe<GraphResponseTradeObject[]>
}

type LiquidityGraphResponse = {
  fpmmLiquidities: Maybe<GraphResponseLiquidityObject[]>
}

type Result = {
  fetchData: () => Promise<void>
  trades: Maybe<TradeObject[]>
  liquidityTxs: Maybe<LiquidityObject[]>
  status: Status
}

let needTradeRefetch = false
let needLiquidityRefetch = false

const wrangleTradeResponse = (data: GraphResponseTradeObject[]) => {
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

const wrangleLiquidityResponse = (data: GraphResponseLiquidityObject[]) => {
  const mappedData = data.map(datum => {
    return {
      type: datum.type,
      additionalSharesCost: bigNumberify(datum.additionalSharesCost),
    }
  })

  return mappedData
}

export const useGraphMarketUserTxData = (marketAddress: string, cpkAddress: string | undefined): Result => {
  const [trades, setTrades] = useState<Maybe<TradeObject[]>>(null)
  const [needTradeUpdate, setNeedTradeUpdate] = useState<boolean>(false)
  const [liquidity, setLiquidity] = useState<Maybe<LiquidityObject[]>>(null)
  const [needLiquidityUpdate, setNeedLiquidityUpdate] = useState<boolean>(false)

  const { data: tradeData, error: tradeError, loading: tradeLoading, refetch: tradeRefetch } = useQuery<
    TradeGraphResponse
  >(tradeQuery, {
    notifyOnNetworkStatusChange: true,
    skip: false,
    variables: { marketAddress: marketAddress, cpkAddress: cpkAddress },
  })

  const { data: liquidityData, error: liquidityError, loading: liquidityLoading, refetch: liquidityRefetch } = useQuery<
    LiquidityGraphResponse
  >(liquidityQuery, {
    notifyOnNetworkStatusChange: true,
    skip: false,
    variables: { marketAddress: marketAddress, cpkAddress: cpkAddress },
  })

  useEffect(() => {
    setNeedTradeUpdate(true)
    setNeedLiquidityUpdate(true)
  }, [marketAddress, cpkAddress])

  useEffect(() => {
    if (!marketAddress || !cpkAddress) {
      setTrades([])
      setLiquidity([])
    }
  }, [marketAddress, cpkAddress])

  if (tradeData && tradeData.fpmmTrades) {
    const wrangledValue = wrangleTradeResponse(tradeData.fpmmTrades)
    if (needTradeUpdate) {
      setTrades(wrangledValue)
      setNeedTradeUpdate(false)
    } else if (!isObjectEqual(trades, wrangledValue)) {
      setTrades(wrangledValue)
      needTradeRefetch = false
    }
  }

  if (liquidityData && liquidityData.fpmmLiquidities) {
    const wrangledValue = wrangleLiquidityResponse(liquidityData.fpmmLiquidities)
    if (needLiquidityUpdate) {
      setLiquidity(wrangledValue)
      setNeedLiquidityUpdate(false)
    } else if (!isObjectEqual(liquidity, wrangledValue)) {
      setLiquidity(wrangledValue)
      needLiquidityRefetch = false
    }
  }

  const fetchData = async () => {
    needTradeRefetch = true
    needLiquidityRefetch = true
    let counter = 0
    await waitABit()
    while ((needTradeRefetch || needLiquidityRefetch) && counter < 15) {
      await tradeRefetch()
      await liquidityRefetch()
      await waitABit()
      counter += 1
    }
  }

  return {
    fetchData,
    trades: tradeError ? null : trades,
    liquidityTxs: liquidityError ? null : liquidity,
    status:
      tradeError || liquidityError ? Status.Error : tradeLoading || liquidityLoading ? Status.Loading : Status.Ready,
  }
}
