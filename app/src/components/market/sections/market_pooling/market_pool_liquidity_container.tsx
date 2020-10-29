import React from 'react'

import { MarketMakerData } from '../../../../util/types'

import { MarketPoolLiquidity } from './market_pool_liquidity'
import { ScalarMarketPoolLiquidity } from './scalar_market_pool_liquidity'

interface Props {
  marketMakerData: MarketMakerData
  fetchGraphMarketMakerData: () => Promise<void>
  switchMarketTab: (arg0: string) => void
  isScalar: boolean
}

const MarketPoolLiquidityContainer: React.FC<Props> = (props: Props) => {
<<<<<<< HEAD
  const { isScalar } = props

  if (isScalar) return <ScalarMarketPoolLiquidity {...props} />
  return <MarketPoolLiquidity {...props} />
=======
  const { isScalar, marketMakerData, switchMarketTab } = props

  if (isScalar) {
    return <ScalarMarketPoolLiquidity marketMakerData={marketMakerData} switchMarketTab={switchMarketTab} />
  } else {
    return <MarketPoolLiquidity marketMakerData={marketMakerData} switchMarketTab={switchMarketTab} />
  }
>>>>>>> bcee2cba... Create barebones scalar market pool liquidity view
}

export { MarketPoolLiquidityContainer }
