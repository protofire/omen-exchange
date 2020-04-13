import React from 'react'

import { MarketMakerData } from '../../../../util/types'

import { MarketBuy } from './market_buy'

interface Props {
  marketMakerData: MarketMakerData
}

const MarketBuyContainer: React.FC<Props> = (props: Props) => {
  const { marketMakerData } = props

  return <MarketBuy marketMakerData={marketMakerData} />
}

export { MarketBuyContainer }
