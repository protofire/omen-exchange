import React from 'react'

import { MarketDetailsTab, MarketMakerData } from '../../../../util/types'

import { MarketBuy } from './market_buy'
import { ScalarMarketBuy } from './scalar_market_buy'

interface Props {
  isScalar: boolean
  marketMakerData: MarketMakerData
  switchMarketTab: (arg0: MarketDetailsTab) => void
  fetchGraphMarketMakerData: () => Promise<void>
  fetchGraphMarketUserTxData: () => Promise<void>
}

const MarketBuyContainer: React.FC<Props> = (props: Props) => {
  const { isScalar } = props

  return <>{isScalar ? <ScalarMarketBuy {...props} /> : <MarketBuy {...props} />}</>
}

export { MarketBuyContainer }
