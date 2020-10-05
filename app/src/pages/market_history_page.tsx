import React from 'react'

import { HistoryChartContainer } from '../components/market/sections/market_history'
import { MarketMakerData } from '../util/types'

type Props = {
  marketMakerData: MarketMakerData
}

const MarketBuyPage: React.FC<Props> = ({ marketMakerData }) => {
  return <HistoryChartContainer marketMakerData={marketMakerData} />
}

export { MarketBuyPage }
