import React from 'react'

import { MarketMakerData } from '../../../../util/types'

import { MarketSell } from './market_sell'
import { ScalarMarketSell } from './scalar_market_sell'

interface Props {
  marketMakerData: MarketMakerData
  switchMarketTab: (arg0: string) => void
  isScalar: boolean
}

const MarketSellContainer: React.FC<Props> = (props: Props) => {
  const { isScalar, marketMakerData, switchMarketTab } = props

  if (isScalar) {
    return <ScalarMarketSell marketMakerData={marketMakerData} switchMarketTab={switchMarketTab} />
  } else {
    return <MarketSell marketMakerData={marketMakerData} switchMarketTab={switchMarketTab} />
  }
}

export { MarketSellContainer }
