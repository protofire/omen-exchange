import React from 'react'

import { MarketHome } from './market_home'
import { useConnectedWeb3Context } from '../../hooks/connectedWeb3'
import { useMarkets } from '../../hooks/useMarkets'

interface Props {
  marketMakerAddress: string
}

const MarketHomeContainer = () => {
  const context = useConnectedWeb3Context()

  const { markets, status } = useMarkets(context)

  return <MarketHome markets={markets} status={status} />
}

export { MarketHomeContainer }
