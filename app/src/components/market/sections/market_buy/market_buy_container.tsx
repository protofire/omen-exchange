import React from 'react'

import { MarketMakerData } from '../../../../util/types'

import { MarketBuy } from './market_buy'

interface Props {
  marketMakerData: MarketMakerData
  switchMarketTab: (arg0: string) => void
}

const MarketBuyContainer: React.FC<Props> = (props: Props) => {
  const { marketMakerData, switchMarketTab } = props

  return <MarketBuy marketMakerData={marketMakerData} switchMarketTab={switchMarketTab} />
}

export { MarketBuyContainer }
