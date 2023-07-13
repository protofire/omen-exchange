import { useQuery } from '@apollo/react-hooks'
import { useInterval } from '@react-corekit/use-interval'
import { ethers } from 'ethers'
import { bigNumberify } from 'ethers/utils'
import React, { useCallback, useEffect, useState } from 'react'
import { useHistory } from 'react-router'
import { useLocation } from 'react-router-dom'

import { MAX_MARKET_FEE } from '../../common/constants'
import { MarketHome, myMarketsSortOptions } from '../../components/market/market_list/market_home'
import { useConnectedWeb3Context } from '../../contexts'
import { useMarkets } from '../../hooks/market_data/useMarkets'
import { queryCategories } from '../../queries/markets_home'
import { getArbitratorsByNetwork, getOutcomes } from '../../util/networks'
import { RemoteData } from '../../util/remote_data'
import {
  CategoryDataItem,
  CurationSource,
  GraphMarketMakerDataItem,
  GraphResponseCategories,
  MarketFilters,
  MarketMakerDataItem,
  MarketStates,
  MarketsSortCriteria,
} from '../../util/types'

const wrangleResponse = (data: GraphMarketMakerDataItem[], networkId: number): MarketMakerDataItem[] => {
  return data.map((graphMarketMakerDataItem: GraphMarketMakerDataItem) => {
    const outcomes = graphMarketMakerDataItem.outcomes
      ? graphMarketMakerDataItem.outcomes
      : getOutcomes(networkId, +graphMarketMakerDataItem.templateId)
    return {
      address: graphMarketMakerDataItem.id,
      arbitrator: graphMarketMakerDataItem.arbitrator,
      creationTimestamp: graphMarketMakerDataItem.creationTimestamp,
      curatedByDxDao: graphMarketMakerDataItem.curatedByDxDao,
      category: graphMarketMakerDataItem.category,
      collateralToken: graphMarketMakerDataItem.collateralToken,
      collateralVolume: bigNumberify(graphMarketMakerDataItem.collateralVolume),
      lastActiveDay: Number(graphMarketMakerDataItem.lastActiveDay),
      scaledLiquidityParameter: parseFloat(graphMarketMakerDataItem.scaledLiquidityParameter),
      runningDailyVolumeByHour: graphMarketMakerDataItem.runningDailyVolumeByHour,
      openingTimestamp: new Date(1000 * +graphMarketMakerDataItem.openingTimestamp),
      oracle: graphMarketMakerDataItem.condition.oracle ? graphMarketMakerDataItem.condition.oracle : null,
      outcomeTokenAmounts: graphMarketMakerDataItem.outcomeTokenAmounts.map(bigNumberify),
      outcomeTokenMarginalPrices: graphMarketMakerDataItem.outcomeTokenMarginalPrices,
      outcomes,
      templateId: +graphMarketMakerDataItem.templateId,
      totalPoolShares: graphMarketMakerDataItem.totalPoolShares,
      title: graphMarketMakerDataItem.title,
      usdLiquidityParameter: parseFloat(graphMarketMakerDataItem.usdLiquidityParameter),
      klerosTCRregistered: graphMarketMakerDataItem.klerosTCRregistered,
      curatedByDxDaoOrKleros: graphMarketMakerDataItem.curatedByDxDaoOrKleros,
      scalarLow: graphMarketMakerDataItem.condition.scalarLow ? graphMarketMakerDataItem.condition.scalarLow : null,
      scalarHigh: graphMarketMakerDataItem.condition.scalarHigh ? graphMarketMakerDataItem.condition.scalarHigh : null,
    }
  })
}

const MarketHomeContainer: React.FC = () => {
  const context = useConnectedWeb3Context()

  const history = useHistory()

  const location = useLocation()

  const stateFilter = location.search.includes('state')
  let stateRoute = location.search.split('state=')[1]
  if (stateRoute) stateRoute = stateRoute.split('&')[0]

  let sortRoute
  let sortDirection: 'desc' | 'asc' = 'desc'
  if (stateRoute !== 'MY_MARKETS') {
    sortRoute = location.pathname.split('/')[1]
  }

  const currencyFilter = location.pathname.includes('currency')
  let currencyRoute = location.pathname.split('/currency/')[1]
  if (currencyRoute) currencyRoute = currencyRoute.split('/')[0]

  const arbitratorFilter = location.pathname.includes('arbitrator')
  let arbitratorRoute = location.pathname.split('/arbitrator/')[1]
  if (arbitratorRoute) arbitratorRoute = arbitratorRoute.split('/')[0]

  const curationSourceFilter = location.pathname.includes('curation-source')
  let curationSourceRoute = location.pathname.split('/curation-source/')[1]
  if (curationSourceRoute) curationSourceRoute = curationSourceRoute.split('/')[0]

  const categoryFilter = location.pathname.includes('category')
  let categoryRoute = location.pathname.split('/category/')[1]
  if (categoryRoute) categoryRoute = categoryRoute.split('/')[0]

  const typeFilter = location.pathname.includes('type')
  let typeRoute = location.pathname.split('/type/')[1]
  if (typeRoute) typeRoute = typeRoute.split('/')[0]

  const searchFilter = location.search.includes('tag')
  let searchRoute = location.search.split('table=')[1]
  if (searchRoute) searchRoute = searchRoute.split('&')[0]

  let sortParam: Maybe<MarketsSortCriteria> = stateRoute === 'MY_MARKETS' ? 'openingTimestamp' : 'usdLiquidityParameter'
  let sortIndex: number = stateRoute === 'MY_MARKETS' ? 1 : 2

  if (stateRoute !== 'MY_MARKETS') {
    switch (sortRoute) {
      case '24h-volume':
        sortIndex = 0
        sortParam = `sort24HourVolume${Math.floor(Date.now() / (1000 * 60 * 60)) % 24}` as MarketsSortCriteria
        break
      case 'volume':
        sortIndex = 1
        sortParam = 'usdVolume'
        break
      case 'liquidity':
        sortIndex = 2
        sortParam = 'usdLiquidityParameter'
        break
      case 'newest':
        sortIndex = 3
        sortParam = 'creationTimestamp'
        break
      case 'ending':
        sortIndex = 4
        sortParam = 'openingTimestamp'
        sortDirection = 'asc'
        break
      default:
        console.warn('Unknown state route')
    }
  }

  let currencyParam: string | null
  if (currencyFilter) {
    currencyParam = currencyRoute
  } else {
    currencyParam = null
  }

  let arbitratorParam: string | null
  if (arbitratorFilter) {
    arbitratorParam = arbitratorRoute
  } else {
    arbitratorParam = null
  }

  let curationSourceParam: CurationSource
  if (curationSourceFilter) {
    curationSourceParam = curationSourceRoute as CurationSource
  } else {
    curationSourceParam = CurationSource.ALL_SOURCES
  }

  let categoryParam: string
  if (categoryFilter) {
    categoryParam = categoryRoute
  } else {
    categoryParam = 'All'
  }

  let stateParam: MarketStates = MarketStates.open
  if (stateFilter) {
    switch (stateRoute) {
      case 'OPEN':
        stateParam = MarketStates.open
        break
      case 'PENDING':
        stateParam = MarketStates.pending
        break
      case 'FINALIZING':
        stateParam = MarketStates.finalizing
        break
      case 'ARBITRATING':
        stateParam = MarketStates.arbitrating
        break
      case 'CLOSED':
        stateParam = MarketStates.closed
        break
      case 'MY_MARKETS':
        stateParam = MarketStates.myMarkets
        break
      default:
        console.warn('Unknown stateRoute')
    }
  } else {
    stateParam = MarketStates.open
  }

  let searchParam: string
  if (searchFilter) {
    searchParam = decodeURIComponent(searchRoute)
  } else {
    searchParam = ''
  }

  let typeParam: Maybe<string>
  if (typeFilter) {
    typeParam = typeRoute
  } else {
    typeParam = null
  }

  const [filter, setFilter] = useState<MarketFilters>({
    state: stateParam,
    category: categoryParam,
    title: searchParam,
    sortIndex: sortIndex,
    sortBy: sortParam,
    sortByDirection: sortDirection,
    arbitrator: arbitratorParam,
    templateId: typeParam,
    currency: currencyParam,
    curationSource: curationSourceParam,
  })

  const [markets, setMarkets] = useState<RemoteData<MarketMakerDataItem[]>>(RemoteData.notAsked())
  const [categories, setCategories] = useState<RemoteData<CategoryDataItem[]>>(RemoteData.notAsked())

  const cpkAddress = context.cpk?.address

  const PAGE_SIZE = 12
  const [pageIndex, setPageIndex] = useState(0)

  const calcNow = useCallback(() => (Date.now() / 1000).toFixed(0), [])
  const [now, setNow] = useState<string>(calcNow())
  const [isFiltering, setIsFiltering] = useState(false)
  const feeBN = ethers.utils.parseEther('' + MAX_MARKET_FEE / Math.pow(10, 2))

  const knownArbitrators = getArbitratorsByNetwork(context.networkId).map(x => x.address)
  const fetchMyMarkets = filter.state === MarketStates.myMarkets

  const marketsQueryVariables = {
    first: PAGE_SIZE,
    skip: pageIndex,
    accounts: cpkAddress ? [cpkAddress] : null,
    account: (cpkAddress && cpkAddress.toLowerCase()) || '',
    fee: feeBN.toString(),
    now: +now,
    knownArbitrators,
    ...filter,
  }

  const { error, loading, markets: fetchedMarkets, moreMarkets } = useMarkets(marketsQueryVariables)

  const { data: fetchedCategories, error: categoriesError, loading: categoriesLoading } = useQuery<
    GraphResponseCategories
  >(queryCategories, {
    notifyOnNetworkStatusChange: true,
  })

  useInterval(() => setNow(calcNow), 1000 * 60 * 5)

  useEffect(() => {
    if (loading) {
      setMarkets(markets => (RemoteData.hasData(markets) ? RemoteData.reloading(markets.data) : RemoteData.loading()))
    } else if (fetchedMarkets) {
      const { fixedProductMarketMakers } = fetchedMarkets
      setMarkets(RemoteData.success(wrangleResponse(fixedProductMarketMakers, context.networkId)))
      setIsFiltering(false)
    } else if (error) {
      setMarkets(RemoteData.failure(error))
      setIsFiltering(false)
    }
  }, [fetchedMarkets, loading, error, context.networkId, PAGE_SIZE, pageIndex, cpkAddress])

  useEffect(() => {
    if (categoriesLoading) {
      setCategories(categories =>
        RemoteData.hasData(categories) ? RemoteData.reloading(categories.data) : RemoteData.loading(),
      )
    } else if (fetchedCategories) {
      const { categories } = fetchedCategories
      setCategories(RemoteData.success(categories))

      setIsFiltering(false)
    } else if (categoriesError) {
      setMarkets(RemoteData.failure(categoriesError))
      setIsFiltering(false)
    }
  }, [fetchedCategories, categoriesLoading, categoriesError, context.networkId])

  const onFilterChange = useCallback(
    (filter: any) => {
      setFilter(filter)
      setPageIndex(0)
      setIsFiltering(true)

      let route = ''
      const routeQueryStart = '?'
      const routeQueryArray: string[] = []

      if (filter.state !== 'MY_MARKETS') {
        switch (filter.sortBy) {
          case `sort24HourVolume${Math.floor(Date.now() / (1000 * 60 * 60)) % 24}`:
            route += '/24h-volume'
            break
          case 'usdVolume':
            route += '/volume'
            break
          case 'creationTimestamp':
            route += '/newest'
            break
          case 'openingTimestamp':
            route += '/ending'
            break
          case 'usdLiquidityParameter':
            route += '/liquidity'
            break
          default:
            console.warn('Unknown sortBy filter')
        }
      }

      if (filter.currency) {
        route += `/currency/${filter.currency}`
      }

      if (filter.arbitrator) {
        route += `/arbitrator/${filter.arbitrator}`
      }

      if (filter.category && filter.category !== 'All') {
        route += `/category/${filter.category}`
      }

      if (filter.templateId && filter.templateId !== '') {
        route += `/type/${filter.templateId}`
      }

      if (filter.state && filter.state !== 'OPEN') {
        routeQueryArray.push(`state=${filter.state}`)
      }

      if (filter.title) {
        routeQueryArray.push(`tag=${filter.title}`)
      }

      if (filter.curationSource && filter.curationSource !== 'Any') {
        route += `/curation-source/${filter.curationSource}`
      }

      const routeQueryString = routeQueryArray.join('&')
      const routeQuery = routeQueryString ? routeQueryStart.concat(routeQueryString) : ''

      const path = `${route}${routeQuery}`
      if (window.location.hash.replace('#', '') !== path) {
        history.push(path)
      }
    },
    [history],
  )

  useEffect(() => {
    let newFilter = filter
    if (
      filter.state === MarketStates.myMarkets &&
      filter.sortIndex &&
      filter.sortIndex >= myMarketsSortOptions.length
    ) {
      newFilter = {
        ...filter,
        sortIndex: 1,
      }
    }

    onFilterChange(newFilter)
  }, [filter, onFilterChange])

  const loadNextPage = () => {
    if (!moreMarkets) {
      return
    }

    setPageIndex(pageIndex + PAGE_SIZE)
  }

  const loadPrevPage = () => {
    if (pageIndex === 0) {
      return
    }

    setPageIndex(pageIndex - PAGE_SIZE)
  }

  return (
    <>
      <MarketHome
        categories={categories}
        context={context}
        count={fetchedMarkets ? fetchedMarkets.fixedProductMarketMakers.length : 0}
        currentFilter={filter}
        fetchMyMarkets={fetchMyMarkets}
        isFiltering={isFiltering}
        markets={markets}
        moreMarkets={moreMarkets}
        onFilterChange={onFilterChange}
        onLoadNextPage={loadNextPage}
        onLoadPrevPage={loadPrevPage}
        pageIndex={pageIndex}
      />
    </>
  )
}

export { MarketHomeContainer }
