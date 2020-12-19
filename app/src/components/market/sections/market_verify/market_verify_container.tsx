import React from 'react'

import { MarketDetailsTab, MarketMakerData } from '../../../../util/types'

import { MarketVerify } from './market_verify'

interface Props {
  marketMakerData: MarketMakerData
  switchMarketTab: (arg0: MarketDetailsTab) => void
  fetchGraphMarketMakerData: () => Promise<void>
}

const MarketVerifyContainer: React.FC<Props> = (props: Props) => {
  const { fetchGraphMarketMakerData, marketMakerData, switchMarketTab } = props
  return (
    <MarketVerify
      fetchGraphMarketMakerData={fetchGraphMarketMakerData}
      marketMakerData={marketMakerData}
      switchMarketTab={switchMarketTab}
    />
  )
}

export { MarketVerifyContainer }
