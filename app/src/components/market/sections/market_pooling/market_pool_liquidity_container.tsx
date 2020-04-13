import React from 'react'

import { MarketMakerData } from '../../../../util/types'

import { MarketPoolLiquidity } from './market_pool_liquidity'

interface Props {
  marketMakerData: MarketMakerData
}

const MarketPoolLiquidityContainer: React.FC<Props> = (props: Props) => {
  const { marketMakerData } = props

  return <MarketPoolLiquidity marketMakerData={marketMakerData} />
}

export { MarketPoolLiquidityContainer }
