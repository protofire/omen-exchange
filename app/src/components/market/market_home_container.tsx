import { useQuery } from '@apollo/react-hooks'
import React, { useEffect, useState } from 'react'
import { Waypoint } from 'react-waypoint'

import { useConnectedWeb3Context } from '../../hooks/connectedWeb3'
import { MARKETS_HOME } from '../../queries/markets_home'
import { CPKService } from '../../services'
import { RemoteData } from '../../util/remote_data'

import { MarketHome } from './market_home'

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

  const { library: provider } = context

  const { data: fetchedMarkets, error, fetchMore, loading } = useQuery(MARKETS_HOME[filter.state], {
    notifyOnNetworkStatusChange: true,
    variables: { first: PAGE_SIZE, skip: 0, account: cpkAddress, ...filter },
  })

  useEffect(() => {
    const getCpkAddress = async () => {
      const cpk = await CPKService.create(provider)
      setCpkAddress(cpk.address)
    }
    getCpkAddress()
  }, [provider])

  useEffect(() => {
    if (loading && moreMarkets) {
      setMarkets(markets => (RemoteData.hasData(markets) ? RemoteData.reloading(markets.data) : RemoteData.loading()))
    } else if (error) {
      setMarkets(RemoteData.failure(error))
    } else if (fetchedMarkets) {
      if (fetchedMarkets.fixedProductMarketMakers.length) {
        const { fixedProductMarketMakers } = fetchedMarkets
        setMarkets(RemoteData.success(fixedProductMarketMakers))
      }
    }
  }, [fetchedMarkets, moreMarkets, loading, error])

  const onFilterChange = (filter: any) => {
    setMoreMarkets(true)
    setFilter(filter)
  }
  const showMore = () => {
    if (!moreMarkets) return
    fetchMore({
      variables: {
        skip: fetchedMarkets.fixedProductMarketMakers.length,
      },
      updateQuery: (prev, { fetchMoreResult }) => {
        setMoreMarkets(!!fetchMoreResult.fixedProductMarketMakers.length)
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
        onShowMore={showMore}
      />
      {RemoteData.is.success(markets) && moreMarkets && <Waypoint onEnter={showMore} />}
    </>
  )
}

export { MarketHomeContainer }
