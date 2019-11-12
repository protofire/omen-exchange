import React from 'react'

import { MarketHome } from './market_home'
import { useConnectedWeb3Context } from '../../hooks/connectedWeb3'
import { useMarkets } from '../../hooks/useMarkets'

const MarketHomeConnectedContainer: React.FC = () => {
  const context = useConnectedWeb3Context()

  const { markets, status } = useMarkets(context)

  return <MarketHome markets={markets} status={status} context={context} />
}

export { MarketHomeConnectedContainer }
