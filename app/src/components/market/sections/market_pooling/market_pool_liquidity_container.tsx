import React from 'react'

import { MarketDetailsTab, MarketMakerData } from '../../../../util/types'

import { MarketPoolLiquidity } from './market_pool_liquidity'
import { ScalarMarketPoolLiquidity } from './scalar_market_pool_liquidity'

interface Props {
  marketMakerData: MarketMakerData
  fetchGraphMarketMakerData: () => Promise<void>
  fetchGraphMarketTradeData?: () => Promise<void> | undefined
  switchMarketTab: (arg0: MarketDetailsTab) => void
  isScalar: boolean
}

const MarketPoolLiquidityContainer: React.FC<Props> = (props: Props) => {
  const { isScalar } = props

  if (isScalar) return <ScalarMarketPoolLiquidity {...props} />
  return <MarketPoolLiquidity {...props} />
}

export { MarketPoolLiquidityContainer }
