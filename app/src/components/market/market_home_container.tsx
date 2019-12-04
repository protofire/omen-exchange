import React, { useState } from 'react'
import { Waypoint } from 'react-waypoint'

import { MarketHome } from './market_home'
import { useConnectedWeb3Context } from '../../hooks/connectedWeb3'
import { useMarkets } from '../../hooks/useMarkets'
import { RemoteData } from '../../util/remote_data'
import { MarketFilters } from '../../util/types'

const PAGE_SIZE = 10

const MarketHomeContainer: React.FC = () => {
  const context = useConnectedWeb3Context()

  const [filter, setFilter] = useState<MarketFilters>(MarketFilters.AllMarkets)
  const [count, setCount] = useState(PAGE_SIZE)

  const { markets, moreMarkets } = useMarkets(context, filter, count)

  const showMore = () => setCount(count => count + PAGE_SIZE)
  const onFilterChange = (filter: MarketFilters) => {
    setCount(PAGE_SIZE)
    setFilter(filter)
  }

  return (
    <>
      <MarketHome
        markets={markets}
        count={count}
        moreMarkets={moreMarkets}
        context={context}
        currentFilter={filter}
        onFilterChange={onFilterChange}
        onShowMore={showMore}
      />
      {RemoteData.is.success(markets) && <Waypoint onEnter={showMore} />}
    </>
  )
}

export { MarketHomeContainer }
