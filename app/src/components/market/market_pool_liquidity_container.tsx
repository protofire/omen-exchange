import React from 'react'

import { useMarketMakerData, useQuestion } from '../../hooks'
import { useConnectedWeb3Context } from '../../hooks/connectedWeb3'
import { FullLoading } from '../loading'

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
    userPoolShares,
  } = marketMakerData

  if (!collateral) {
    return <FullLoading />
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
      userPoolShares={userPoolShares}
    />
  )
}

export { MarketPoolLiquidityContainer }
