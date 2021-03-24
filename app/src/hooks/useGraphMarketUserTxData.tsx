import { useQuery } from '@apollo/react-hooks'
import { BigNumber, bigNumberify } from 'ethers/utils'
import gql from 'graphql-tag'
import { useEffect, useState } from 'react'

import { getLogger } from '../util/logger'
import { getContractAddress } from '../util/networks'
import { LiquidityObject, LiquidityType, Status, TradeObject, TradeType } from '../util/types'

const logger = getLogger('useGraphMarketUserTxData')

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
  const [liquidity, setLiquidity] = useState<LiquidityObject[]>([])

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
  const { data: marketLiquidityData, loading: marketLiquidityLoading } = useQuery<LiquidityGraphResponse>(
    liquidityQuery,
    {
      notifyOnNetworkStatusChange: true,
      skip: false,
      variables: { marketAddress: marketAddress, cpkAddress: factoryAddress },
    },
  )

  useEffect(() => {
    if (!tradeLoading && tradeData && tradeData.fpmmTrades) {
      const wrangledValue = wrangleTradeResponse(tradeData.fpmmTrades)
      setTrades(wrangledValue)
    }
  }, [tradeData, tradeLoading])

  useEffect(() => {
    if (!liquidityLoading && !marketLiquidityLoading && liquidityData && liquidityData.fpmmLiquidities) {
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
      setLiquidity(wrangledValue)
    }
  }, [liquidityLoading, marketLiquidityLoading, liquidityData, marketLiquidityData])

  useEffect(() => {
    if (!marketAddress || !cpkAddress) {
      setTrades([])
      setLiquidity([])
    }
  }, [marketAddress, cpkAddress])

  const fetchData = async () => {
    try {
      await tradeRefetch()
      await liquidityRefetch()
    } catch (error) {
      logger.log(error.message)
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
