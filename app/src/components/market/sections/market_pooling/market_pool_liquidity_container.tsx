import React from 'react'

import { MarketMakerData } from '../../../../util/types'

import { MarketPoolLiquidity } from './market_pool_liquidity'
import { ScalarMarketPoolLiquidity } from './scalar_market_pool_liquidity'

interface Props {
  marketMakerData: MarketMakerData
  switchMarketTab: (arg0: string) => void
  isScalar: boolean
}

const MarketPoolLiquidityContainer: React.FC<Props> = (props: Props) => {
  const { isScalar, marketMakerData, switchMarketTab } = props

  if (isScalar) return <ScalarMarketPoolLiquidity marketMakerData={marketMakerData} switchMarketTab={switchMarketTab} />
  return <MarketPoolLiquidity marketMakerData={marketMakerData} switchMarketTab={switchMarketTab} />
}

export { MarketPoolLiquidityContainer }
