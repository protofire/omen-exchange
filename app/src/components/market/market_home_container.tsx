import React, { useState, useEffect } from 'react'
import { Waypoint } from 'react-waypoint'

import { MarketHome } from './market_home'
import { useConnectedWeb3Context } from '../../hooks/connectedWeb3'
import { useMarkets } from '../../hooks/useMarkets'
import { RemoteData } from '../../util/remote_data'
import { MarketFilter } from '../../util/market_filter'
import { useQuery } from '@apollo/react-hooks'
import { MARKETS_HOME } from '../../queries/markets_home'
import { CPKService } from '../../services'

const PAGE_SIZE = 1

const MarketHomeContainer: React.FC = () => {
  const context = useConnectedWeb3Context()

  const [filter, setFilter] = useState<any>({
    state: 'OPEN',
    category: 'All',
    searchText: '',
    sortBy: null,
  })
  const [markets, setMarkets] = useState<RemoteData<any>>(RemoteData.notAsked())
  const [count, setCount] = useState(0)
  const [cpkAddress, setCpkAddress] = useState<Maybe<string>>(null)
  const { library: provider } = context

  const showMore = () => setCount(count => count + PAGE_SIZE)
  const onFilterChange = (filter: MarketFilter) => {
    setCount(0)
    setFilter(filter)
  }

  const { data, loading, error, variables } = useQuery(MARKETS_HOME[filter.state], {
    fetchPolicy: 'no-cache',
    //skip: skipQuery,
    variables: { first: PAGE_SIZE, skip: count, account: cpkAddress, ...filter },
  })

  console.log(variables)

  useEffect(() => {
    const getCpkAddress = async () => {
      const cpk = await CPKService.create(provider)
      setCpkAddress(cpk.address)
    }
    getCpkAddress()
  }, [provider])

  useEffect(() => {
    if (data && !loading && !error) {
      console.log(data)
      if (data.fixedProductMarketMakers.length) {
        const { fixedProductMarketMakers } = data
        // setSkipQuery(true)
        const currentMarkets = RemoteData.getDataOr(markets, [])
        setMarkets(RemoteData.success([...currentMarkets, ...fixedProductMarketMakers]))
      }
    }
  }, [data, loading, error])

  // if (loading) {
  //   setMarkets(RemoteData.loading())
  //   console.log('LOADING')
  //   return null
  // } else if (error) {
  //   setMarkets(RemoteData.failure(error))
  //   console.log('ERROR')
  // }

  return (
    <>
      <MarketHome
        markets={markets}
        count={count}
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
