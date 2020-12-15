import React from 'react'

import { MarketDetailsTab, MarketMakerData } from '../../../../util/types'

import { MarketSell } from './market_sell'
import { ScalarMarketSell } from './scalar_market_sell'

interface Props {
  isScalar: boolean
  marketMakerData: MarketMakerData
  switchMarketTab: (arg0: MarketDetailsTab) => void
  fetchGraphMarketMakerData: () => Promise<void>
}

const MarketSellContainer: React.FC<Props> = (props: Props) => {
  const { isScalar } = props

  if (isScalar) return <ScalarMarketSell {...props} />
  return <MarketSell {...props} />
}

export { MarketSellContainer }
