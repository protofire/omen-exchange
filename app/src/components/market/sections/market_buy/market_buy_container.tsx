import React from 'react'

import { MarketMakerData } from '../../../../util/types'

import { MarketBuy } from './market_buy'
import { ScalarMarketBuy } from './scalar_market_buy'

interface Props {
  marketMakerData: MarketMakerData
  switchMarketTab: (arg0: string) => void
  isScalar: boolean
}

const MarketBuyContainer: React.FC<Props> = (props: Props) => {
  const { isScalar, marketMakerData, switchMarketTab } = props

  if (isScalar) {
    return <ScalarMarketBuy marketMakerData={marketMakerData} switchMarketTab={switchMarketTab} />
  } else {
    return <MarketBuy marketMakerData={marketMakerData} switchMarketTab={switchMarketTab} />
  }
}

export { MarketBuyContainer }
