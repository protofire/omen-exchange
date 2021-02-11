import { useQuery } from '@apollo/react-hooks'
import { BigNumber, bigNumberify } from 'ethers/utils'
import gql from 'graphql-tag'
import { useEffect, useState } from 'react'

import { getContractAddress } from '../util/networks'
import { isObjectEqual, waitABit } from '../util/tools'
import { LiquidityObject, LiquidityType, Status, TradeObject, TradeType } from '../util/types'

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
      outcomeTokenAmounts
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
  type: TradeType
  outcomeIndex: string
}

type GraphResponseLiquidityObject = {
  type: LiquidityType
  additionalSharesCost: string
  outcomeTokenAmounts: string[]
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
      outcomeTokenAmounts: datum.outcomeTokenAmounts.map(bigNumberify),
    }
  })

  return mappedData
}

export const useGraphMarketUserTxData = (
  marketAddress: string,
  cpkAddress: string | undefined,
  isCreator?: boolean,
  networkId?: number,
): Result => {
  // If user is market creator, retrieve the factory contract address
  const factoryAddress = isCreator && networkId && getContractAddress(networkId, 'marketMakerFactory').toLowerCase()

  const [trades, setTrades] = useState<Maybe<TradeObject[]>>(null)
  const [needTradeUpdate, setNeedTradeUpdate] = useState<boolean>(false)
  const [liquidity, setLiquidity] = useState<LiquidityObject[]>([])
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

  // Run a second liquidity query with the factory address if user is market creator
  const { data: marketLiquidityData } = useQuery<LiquidityGraphResponse>(liquidityQuery, {
    notifyOnNetworkStatusChange: true,
    skip: false,
    variables: { marketAddress: marketAddress, cpkAddress: factoryAddress },
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
    }
  }

  if (liquidityData && liquidityData.fpmmLiquidities) {
    let wrangledValue: {
      type: string
      additionalSharesCost: BigNumber
      outcomeTokenAmounts: BigNumber[]
    }[]
    // If market liquidity data, include in liquidity array
    if (marketLiquidityData && marketLiquidityData.fpmmLiquidities) {
      wrangledValue = wrangleLiquidityResponse(
        liquidityData.fpmmLiquidities.concat(marketLiquidityData.fpmmLiquidities),
      )
    } else {
      wrangledValue = wrangleLiquidityResponse(liquidityData.fpmmLiquidities)
    }
    if (needLiquidityUpdate) {
      setLiquidity(wrangledValue)
      setNeedLiquidityUpdate(false)
    } else if (!isObjectEqual(liquidity, wrangledValue)) {
      setLiquidity(wrangledValue)
    }
  }

  const fetchData = async () => {
    await tradeRefetch()
    await liquidityRefetch()
  }

  return {
    fetchData,
    trades: tradeError ? null : trades,
    liquidityTxs: liquidityError ? null : liquidity,
    status:
      tradeError || liquidityError ? Status.Error : tradeLoading || liquidityLoading ? Status.Loading : Status.Ready,
  }
}
