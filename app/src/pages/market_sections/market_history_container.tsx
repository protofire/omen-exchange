import React from 'react'

import { MarketHistory } from '../../components/market/market_history/market_history'
import { MarketMakerData } from '../../util/types'

interface Props {
  marketMakerData: MarketMakerData
}

const MarketHistoryContainer: React.FC<Props> = (props: Props) => {
  const { marketMakerData } = props

  return <MarketHistory marketMakerData={marketMakerData} />
}

export { MarketHistoryContainer }
