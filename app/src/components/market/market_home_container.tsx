import React, { useState } from 'react'

import { MarketHome } from './market_home'
import { useConnectedOrDisconnectedWeb3Context } from '../../hooks/connectedWeb3'
import { useMarkets } from '../../hooks/useMarkets'
import { MarketFilters } from '../../util/types'

const PAGE_SIZE = 3

const MarketHomeContainer: React.FC = () => {
  const context = useConnectedOrDisconnectedWeb3Context()

  const [filter, setFilter] = useState<MarketFilters>(MarketFilters.AllMarkets)
  const [count, setCount] = useState(PAGE_SIZE)

  const { markets, moreMarkets } = useMarkets(context, filter, count)

  const showMore = () => setCount(count => count + PAGE_SIZE)
  const onFilterChange = (filter: MarketFilters) => {
    setCount(PAGE_SIZE)
    setFilter(filter)
  }

  return (
    <MarketHome
      markets={markets}
      count={count}
      moreMarkets={moreMarkets}
      context={context}
      currentFilter={filter}
      onFilterChange={onFilterChange}
      onShowMore={showMore}
    />
  )
}

export { MarketHomeContainer }
