import { useQuery } from '@apollo/react-hooks'
import React, { useCallback, useEffect, useState } from 'react'
import { Waypoint } from 'react-waypoint'

import { useConnectedWeb3Context } from '../../hooks/connectedWeb3'
import { MARKETS_HOME } from '../../queries/markets_home'
import { CPKService } from '../../services'
import { getLogger } from '../../util/logger'
import { RemoteData } from '../../util/remote_data'

import { MarketHome } from './market_home'

const logger = getLogger('MarketHomeContainer')

const PAGE_SIZE = 10

const MarketHomeContainer: React.FC = () => {
  const context = useConnectedWeb3Context()

  const [filter, setFilter] = useState<any>({
    state: 'OPEN',
    category: 'All',
    searchText: '',
    sortBy: null,
  })
  const [markets, setMarkets] = useState<RemoteData<any>>(RemoteData.notAsked())
  const [cpkAddress, setCpkAddress] = useState<Maybe<string>>(null)
  const [moreMarkets, setMoreMarkets] = useState(true)

  const { account, library: provider } = context

  const { data: fetchedMarkets, error, fetchMore, loading } = useQuery(MARKETS_HOME[filter.state], {
    notifyOnNetworkStatusChange: true,
    variables: { first: PAGE_SIZE, skip: 0, account: cpkAddress, ...filter },
  })

  useEffect(() => {
    const getCpkAddress = async () => {
      try {
        const cpk = await CPKService.create(provider)
        setCpkAddress(cpk.address)
      } catch (e) {
        logger.error('Could not get address of CPK', e.message)
      }
    }
    if (account) {
      getCpkAddress()
    }
  }, [provider, account])

  useEffect(() => {
    if (loading) {
      setMarkets(markets => (RemoteData.hasData(markets) ? RemoteData.reloading(markets.data) : RemoteData.loading()))
    } else if (error) {
      setMarkets(RemoteData.failure(error))
    } else if (fetchedMarkets) {
      const { fixedProductMarketMakers } = fetchedMarkets
      setMarkets(RemoteData.success(fixedProductMarketMakers))
      if (fixedProductMarketMakers.length === 0) {
        setMoreMarkets(false)
      }
    }
  }, [fetchedMarkets, loading, error])

  const onFilterChange = useCallback((filter: any) => {
    setMoreMarkets(true)
    setFilter(filter)
  }, [])

  const loadMore = () => {
    if (!moreMarkets) return
    fetchMore({
      variables: {
        skip: fetchedMarkets.fixedProductMarketMakers.length,
      },
      updateQuery: (prev, { fetchMoreResult }) => {
        setMoreMarkets(fetchMoreResult.fixedProductMarketMakers.length > 0)
        if (!fetchMoreResult) return prev
        return {
          ...prev,
          ...{
            fixedProductMarketMakers: [...prev.fixedProductMarketMakers, ...fetchMoreResult.fixedProductMarketMakers],
          },
        }
      },
    })
  }

  return (
    <>
      <MarketHome
        context={context}
        count={fetchedMarkets ? fetchedMarkets.fixedProductMarketMakers.length : 0}
        currentFilter={filter}
        markets={markets}
        moreMarkets={moreMarkets}
        onFilterChange={onFilterChange}
        onLoadMore={loadMore}
      />
      {RemoteData.is.success(markets) && moreMarkets && <Waypoint onEnter={loadMore} />}
    </>
  )
}

export { MarketHomeContainer }
