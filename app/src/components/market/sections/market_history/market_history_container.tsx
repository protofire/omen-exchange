import React from 'react'

import { MarketMakerData } from '../../../../util/types'

import { MarketHistory } from './market_history'

interface Props {
  marketMakerData: MarketMakerData
}

const MarketHistoryContainer: React.FC<Props> = (props: Props) => {
  const { marketMakerData } = props

  return <MarketHistory marketMakerData={marketMakerData} />
}

export { MarketHistoryContainer }
