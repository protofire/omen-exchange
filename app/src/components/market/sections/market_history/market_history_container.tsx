import React from 'react'

import { MarketMakerData } from '../../../../util/types'

import { MarketHistory } from './market_history'
import { ScalarMarketHistory } from './scalar_market_history'

interface Props {
  marketMakerData: MarketMakerData
  isScalar: boolean
}

const MarketHistoryContainer: React.FC<Props> = (props: Props) => {
  const { isScalar, marketMakerData } = props
  if (isScalar) {
    return <ScalarMarketHistory marketMakerData={marketMakerData} />
  } else {
    return <MarketHistory marketMakerData={marketMakerData} />
  }
}

export { MarketHistoryContainer }
