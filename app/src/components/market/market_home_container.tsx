import React, { useState } from 'react'
import { Waypoint } from 'react-waypoint'

import { useMarkets } from '../../hooks'
import { useConnectedWeb3Context } from '../../hooks/connectedWeb3'
import { MarketFilter } from '../../util/market_filter'
import { RemoteData } from '../../util/remote_data'

import { MarketHome } from './market_home'

const PAGE_SIZE = 10

const MarketHomeContainer: React.FC = () => {
  const context = useConnectedWeb3Context()

  const [filter, setFilter] = useState<MarketFilter>(MarketFilter.allMarkets())
  const [count, setCount] = useState(PAGE_SIZE)

  const { markets, moreMarkets } = useMarkets(context, filter, count)

  const showMore = () => setCount(count => count + PAGE_SIZE)
  const onFilterChange = (filter: MarketFilter) => {
    setCount(PAGE_SIZE)
    setFilter(filter)
  }

  return (
    <>
      <MarketHome
        context={context}
        count={count}
        currentFilter={filter}
        markets={markets}
        moreMarkets={moreMarkets}
        onFilterChange={onFilterChange}
        onShowMore={showMore}
      />
      {RemoteData.is.success(markets) && <Waypoint onEnter={showMore} />}
    </>
  )
}

export { MarketHomeContainer }
