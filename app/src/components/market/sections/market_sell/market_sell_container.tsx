import React from 'react'

import { MarketDetailsTab, MarketMakerData } from '../../../../util/types'

import { MarketSell } from './market_sell'

interface Props {
  marketMakerData: MarketMakerData
  switchMarketTab: (arg0: MarketDetailsTab) => void
  fetchGraphMarketMakerData: () => Promise<void>
}

const MarketSellContainer: React.FC<Props> = (props: Props) => {
  return <MarketSell {...props} />
}

export { MarketSellContainer }
