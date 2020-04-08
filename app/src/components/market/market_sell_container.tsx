import React from 'react'

import { MarketMakerData } from '../../util/types'

import { MarketSell } from './market_sell'

interface Props {
  marketMakerData: MarketMakerData
}

const MarketSellContainer: React.FC<Props> = (props: Props) => {
  const { marketMakerData } = props

  return <MarketSell marketMakerData={marketMakerData} />
}

export { MarketSellContainer }
