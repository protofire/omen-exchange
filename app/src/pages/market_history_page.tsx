import React from 'react'

import { MarketHistory } from '../components/market/sections/market_history'
import { MarketMakerData } from '../util/types'

type Props = {
  marketMakerData: MarketMakerData
}

const MarketHistoryPage: React.FC<Props> = ({ marketMakerData }) => {
  return <MarketHistory marketMakerData={marketMakerData} />
}

export { MarketHistoryPage }
