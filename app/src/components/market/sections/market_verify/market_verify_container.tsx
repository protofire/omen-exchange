import React from 'react'

import { ConnectedWeb3Context } from '../../../../hooks'
import { MarketDetailsTab, MarketMakerData } from '../../../../util/types'

import { MarketVerify } from './market_verify'

interface Props {
  marketMakerData: MarketMakerData
  context: ConnectedWeb3Context
  switchMarketTab: (arg0: MarketDetailsTab) => void
  fetchGraphMarketMakerData: () => Promise<void>
}

const MarketVerifyContainer: React.FC<Props> = (props: Props) => {
  const { context, fetchGraphMarketMakerData, marketMakerData, switchMarketTab } = props
  return (
    <MarketVerify
      context={context}
      fetchGraphMarketMakerData={fetchGraphMarketMakerData}
      marketMakerData={marketMakerData}
      switchMarketTab={switchMarketTab}
    />
  )
}

export { MarketVerifyContainer }
