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
  const { library: provider } = context

  const { data, error, fetchMore, loading } = useQuery(MARKETS_HOME[filter.state], {
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
    if (loading) {
      setMarkets(markets => (RemoteData.hasData(markets) ? RemoteData.reloading(markets.data) : RemoteData.loading()))
    } else if (error) {
      setMarkets(RemoteData.failure(error))
    } else if (data) {
      if (data.fixedProductMarketMakers.length) {
        const { fixedProductMarketMakers } = data
        setMarkets(RemoteData.success(fixedProductMarketMakers))
      }
    }
  }, [data, loading, error])

  const showMore = () => {
    fetchMore({
      variables: {
        skip: data.fixedProductMarketMakers.length,
      },
      updateQuery: (prev, { fetchMoreResult }) => {
        if (!fetchMoreResult) return prev
        return Object.assign({}, prev, {
          fixedProductMarketMakers: [...prev.fixedProductMarketMakers, ...fetchMoreResult.fixedProductMarketMakers],
        })
      },
    })
  }
  const onFilterChange = (filter: any) => {
    setFilter(filter)
  }

  return (
    <>
      <MarketHome
        context={context}
        count={data ? data.fixedProductMarketMakers.length : 0}
        currentFilter={filter}
        markets={markets}
        onFilterChange={onFilterChange}
        onShowMore={showMore}
      />
      {RemoteData.is.success(markets) && <Waypoint onEnter={showMore} />}
    </>
  )
}

export { MarketHomeContainer }
