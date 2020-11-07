import React from 'react'

import { MarketDetailsTab, MarketMakerData } from '../../../../util/types'

import { MarketPoolLiquidity } from './market_pool_liquidity'

interface Props {
  marketMakerData: MarketMakerData
  fetchGraphMarketMakerData: () => Promise<void>
  switchMarketTab: (arg0: MarketDetailsTab) => void
}

const MarketPoolLiquidityContainer: React.FC<Props> = (props: Props) => {
  return <MarketPoolLiquidity {...props} />
}

export { MarketPoolLiquidityContainer }
