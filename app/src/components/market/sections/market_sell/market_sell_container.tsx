import React from 'react'

import { MarketDetailsTab, MarketMakerData } from '../../../../util/types'

import { MarketSell } from './market_sell'
import { ScalarMarketSell } from './scalar_market_sell'

interface Props {
  currentTab: MarketDetailsTab
  isScalar: boolean
  marketMakerData: MarketMakerData
  switchMarketTab: (arg0: MarketDetailsTab) => void
  fetchGraphMarketMakerData: () => Promise<void>
  fetchGraphMarketUserTxData: () => Promise<void>
}

const MarketSellContainer: React.FC<Props> = (props: Props) => {
  const { isScalar } = props

  return <> {isScalar ? <ScalarMarketSell {...props} /> : <MarketSell {...props} />}</>
}

export { MarketSellContainer }
