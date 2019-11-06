import React from 'react'

import { MarketHome } from './market_home'
import { useDisconnectedWeb3Context } from '../../hooks/disconnectedWeb3'
import { useMarkets } from '../../hooks/useMarkets'

const MarketHomeDisconnectedContainer = () => {
  const context = useDisconnectedWeb3Context()

  const { markets, status } = useMarkets(context)

  return <MarketHome markets={markets} status={status} />
}

export { MarketHomeDisconnectedContainer }
