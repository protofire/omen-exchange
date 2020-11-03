import React from 'react'

import { MarketMakerData } from '../../../../util/types'

import { MarketPoolLiquidity } from './market_pool_liquidity'

interface Props {
  marketMakerData: MarketMakerData
  switchMarketTab: (arg0: string) => void
  isScalar: boolean
}

const MarketPoolLiquidityContainer: React.FC<Props> = (props: Props) => {
  const { isScalar, marketMakerData, switchMarketTab } = props

  return <MarketPoolLiquidity isScalar={isScalar} marketMakerData={marketMakerData} switchMarketTab={switchMarketTab} />
}

export { MarketPoolLiquidityContainer }
