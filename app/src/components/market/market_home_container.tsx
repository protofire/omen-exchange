import React, { useState } from 'react'

import { MarketHome } from './market_home'
import { useConnectedWeb3Context } from '../../hooks/connectedWeb3'
import { useMarkets } from '../../hooks/useMarkets'
import { MarketFilters } from '../../util/types'

const PAGE_SIZE = 3

const MarketHomeContainer: React.FC = () => {
  const context = useConnectedWeb3Context()

  const [filter, setFilter] = useState<MarketFilters>(MarketFilters.AllMarkets)
  const [count, setCount] = useState(PAGE_SIZE)

  const { markets, moreMarkets } = useMarkets(context, filter, count)

  const showMore = () => setCount(count => count + PAGE_SIZE)

  return (
    <MarketHome
      markets={markets}
      moreMarkets={moreMarkets}
      count={count}
      context={context}
      currentFilter={filter}
      onFilterChange={setFilter}
      onShowMore={showMore}
    />
  )
}

export { MarketHomeContainer }
