import React from 'react'

import { ConnectedWeb3Context } from '../../../../hooks'
import { MarketMakerData } from '../../../../util/types'

import { MarketVerify } from './market_verify'

interface Props {
  marketMakerData: MarketMakerData
  context: ConnectedWeb3Context
  switchMarketTab: (arg0: string) => void
}

const MarketVerifyContainer: React.FC<Props> = (props: Props) => {
  const { context, marketMakerData, switchMarketTab } = props

  return <MarketVerify context={context} marketMakerData={marketMakerData} switchMarketTab={switchMarketTab} />
}

export { MarketVerifyContainer }
