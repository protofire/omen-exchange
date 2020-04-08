import React from 'react'

import { MarketSellContainer } from '../components'
import { MarketMakerData } from '../util/types'

type Props = {
  marketMakerData: MarketMakerData
}

const MarketSellPage: React.FC<Props> = ({ marketMakerData }) => {
  return <MarketSellContainer marketMakerData={marketMakerData} />
}

export { MarketSellPage }
