import React, { useState } from 'react'

import { MarketHome } from './market_home'
import { useConnectedOrDisconnectedWeb3Context } from '../../hooks/connectedWeb3'
import { useMarkets } from '../../hooks/useMarkets'
import { MarketFilters } from '../../util/types'

const MarketHomeContainer: React.FC = () => {
  const context = useConnectedOrDisconnectedWeb3Context()

  const [filter, setFilter] = useState<MarketFilters>(MarketFilters.AllMarkets)

  const { markets } = useMarkets(context, filter)

  return (
    <MarketHome
      markets={markets}
      context={context}
      currentFilter={filter}
      onFilterChange={setFilter}
    />
  )
}

export { MarketHomeContainer }
