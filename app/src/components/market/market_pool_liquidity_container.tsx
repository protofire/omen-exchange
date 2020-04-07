import React from 'react'

import { useMarketMakerData, useQuestion } from '../../hooks'
import { useConnectedWeb3Context } from '../../hooks/connectedWeb3'
import { InlineLoading } from '../loading'

import { MarketPoolLiquidity } from './market_pool_liquidity'

interface Props {
  marketMakerAddress: string
}

const MarketPoolLiquidityContainer: React.FC<Props> = (props: Props) => {
  const context = useConnectedWeb3Context()

  const { marketMakerAddress } = props
  const { question, resolution } = useQuestion(marketMakerAddress, context)
  const { marketMakerData } = useMarketMakerData(marketMakerAddress, context)
  const {
    balances,
    collateral,
    marketMakerFunding,
    marketMakerUserFunding,
    totalPoolShares,
    userEarnings,
    userPoolShares,
  } = marketMakerData

  if (!collateral) {
    return <InlineLoading />
  }

  return (
    <MarketPoolLiquidity
      balances={balances}
      collateral={collateral}
      marketMakerAddress={marketMakerAddress}
      marketMakerFunding={marketMakerFunding}
      marketMakerUserFunding={marketMakerUserFunding}
      question={question || ''}
      resolution={resolution}
      totalPoolShares={totalPoolShares}
      userEarnings={userEarnings}
      userPoolShares={userPoolShares}
    />
  )
}

export { MarketPoolLiquidityContainer }
