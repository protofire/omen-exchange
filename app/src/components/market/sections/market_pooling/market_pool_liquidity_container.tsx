import React from 'react'

import { MarketMakerData } from '../../../../util/types'

import { MarketPoolLiquidity } from './market_pool_liquidity'

interface Props {
  marketMakerData: MarketMakerData
  switchMarketTab: (arg0: string) => void
}

const MarketPoolLiquidityContainer: React.FC<Props> = (props: Props) => {
  const { marketMakerData, switchMarketTab } = props

  return <MarketPoolLiquidity marketMakerData={marketMakerData} switchMarketTab={switchMarketTab} />
}

export { MarketPoolLiquidityContainer }
