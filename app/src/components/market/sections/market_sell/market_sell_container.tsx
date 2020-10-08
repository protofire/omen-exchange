import React from 'react'

import { MarketMakerData } from '../../../../util/types'

import { MarketSell } from './market_sell'

interface Props {
  marketMakerData: MarketMakerData
  switchMarketTab: (arg0: string) => void
}

const MarketSellContainer: React.FC<Props> = (props: Props) => {
  const { marketMakerData, switchMarketTab } = props

  return <MarketSell marketMakerData={marketMakerData} switchMarketTab={switchMarketTab} />
}

export { MarketSellContainer }
