import React from 'react'

import { MarketMakerData } from '../../../../util/types'

import { MarketBuy } from './market_buy'

interface Props {
  marketMakerData: MarketMakerData
  switchMarketTab: (arg0: string) => void
  isScalar: boolean
}

const MarketBuyContainer: React.FC<Props> = (props: Props) => {
  const { isScalar, marketMakerData, switchMarketTab } = props

  return <MarketBuy isScalar={isScalar} marketMakerData={marketMakerData} switchMarketTab={switchMarketTab} />
}

export { MarketBuyContainer }
