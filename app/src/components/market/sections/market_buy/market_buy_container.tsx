import React from 'react'

import { MarketMakerData } from '../../../../util/types'

import { MarketBuy } from './market_buy'
import { ScalarMarketBuy } from './scalar_market_buy'

interface Props {
  marketMakerData: MarketMakerData
  switchMarketTab: (arg0: string) => void
  fetchGraphMarketMakerData: () => Promise<void>
  isScalar: boolean
}

const MarketBuyContainer: React.FC<Props> = (props: Props) => {
  const { fetchGraphMarketMakerData, isScalar, marketMakerData, switchMarketTab } = props

  if (isScalar) return <ScalarMarketBuy marketMakerData={marketMakerData} switchMarketTab={switchMarketTab} />
  return (
    <MarketBuy
      fetchGraphMarketMakerData={fetchGraphMarketMakerData}
      marketMakerData={marketMakerData}
      switchMarketTab={switchMarketTab}
    />
  )
}

export { MarketBuyContainer }
