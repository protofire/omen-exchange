import React from 'react'

import { MarketMakerData } from '../../../../util/types'

import { MarketSell } from './market_sell'

interface Props {
  marketMakerData: MarketMakerData
  switchMarketTab: (arg0: string) => void
  isScalar: boolean
}

const MarketSellContainer: React.FC<Props> = (props: Props) => {
  const { isScalar, marketMakerData, switchMarketTab } = props

  return <MarketSell isScalar={isScalar} marketMakerData={marketMakerData} switchMarketTab={switchMarketTab} />
}

export { MarketSellContainer }
