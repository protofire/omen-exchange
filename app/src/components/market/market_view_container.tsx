import React from 'react'

import { useConnectedWeb3Context } from '../../hooks/connectedWeb3'
import { MarketMakerData } from '../../util/types'

import { MarketView } from './market_view'

interface Props {
  marketMakerData: MarketMakerData
}

const MarketViewContainer: React.FC<Props> = (props: Props) => {
  const context = useConnectedWeb3Context()

  const { marketMakerData } = props

  return <MarketView account={context.account} marketMakerData={marketMakerData} />
}

export { MarketViewContainer }
