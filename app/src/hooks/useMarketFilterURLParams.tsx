import { useCallback, useEffect, useState } from 'react'
import { useHistory } from 'react-router'
import { useLocation } from 'react-router-dom'

import { MarketFilters, MarketStates, MarketsSortCriteria } from '../util/types'

const parseCurrency = (pathname: string): Maybe<string> => {
  if (pathname.includes('/currency/')) {
    return pathname.split('/currency/')[1].split('/')[0]
  } else {
    return null
  }
}

const parseArbitrator = (pathname: string): Maybe<string> => {
  if (pathname.includes('arbitrator')) {
    return pathname.split('/arbitrator/')[1].split('/')[0]
  } else {
    return null
  }
}

const parseCategory = (pathname: string): string => {
  if (pathname.includes('category')) {
    return pathname.split('/category/')[1].split('/')[0]
  } else {
    return 'All'
  }
}

const parseSearchParam = (search: string): string => {
  const searchFilter = search.includes('tag')
  let searchRoute = search.split('tag=')[1]
  if (searchRoute) searchRoute = searchRoute.split('&')[0]

  return searchFilter ? searchRoute : ''
}

const parseState = (search: string): MarketStates => {
  const stateFilter = search.includes('state')
  let stateRoute = search.split('state=')[1]
  if (stateRoute) stateRoute = stateRoute.split('&')[0]

  if (!stateFilter) return MarketStates.open
  switch (stateRoute) {
    case 'OPEN':
      return MarketStates.open
    case 'PENDING':
      return MarketStates.pending
    case 'CLOSED':
      return MarketStates.closed
    case 'MY_MARKETS':
      return MarketStates.myMarkets
    default:
      return MarketStates.open
  }
}

const parseSortRoute = (pathname: string): MarketsSortCriteria => {
  const sortRoute = pathname.split('/')[1]

  switch (sortRoute) {
    case '24h-volume':
      return 'lastActiveDayAndScaledRunningDailyVolume'
    case 'volume':
      return 'scaledCollateralVolume'
    case 'newest':
      return 'creationTimestamp'
    case 'ending':
      return 'openingTimestamp'
    case 'liquidity':
      return 'scaledLiquidityParameter'
    default:
      return 'lastActiveDayAndScaledRunningDailyVolume'
  }
}

export const useMarketFilterURLParams = () => {
  const history = useHistory()
  const { pathname, search } = useLocation()

  const [stateParam, setStateParam] = useState<MarketStates>(parseState(search))
  const [categoryParam, setCategoryParam] = useState(parseCategory(pathname))
  const [searchParam, setSearchParam] = useState(parseSearchParam(search))
  const [sortParam, setSortParam] = useState<MarketsSortCriteria>(parseSortRoute(pathname))
  const [sortDirection, setSortDirection] = useState<'desc' | 'asc'>(sortParam === 'openingTimestamp' ? 'asc' : 'desc')
  const [arbitratorParam, setArbitratorParam] = useState<Maybe<string>>(parseArbitrator(pathname))
  const [currencyParam, setCurrencyParam] = useState<Maybe<string>>(parseCurrency(pathname))

  useEffect(() => {
    setCurrencyParam(parseCurrency(pathname))
    setArbitratorParam(parseArbitrator(pathname))
    setCategoryParam(parseCategory(pathname))
    const sortBy = parseSortRoute(pathname)
    setSortParam(sortBy)
    if (sortBy === 'openingTimestamp') {
      setSortDirection('asc')
    }
  }, [pathname])

  useEffect(() => {
    setStateParam(parseState(search))
    setSearchParam(parseSearchParam(search))
  }, [search])

  const updateURL = useCallback(
    (filter: MarketFilters) => {
      let route = ''
      const routeQueryStart = '?'
      const routeQueryArray: string[] = []

      if (filter.sortBy === 'lastActiveDayAndScaledRunningDailyVolume') {
        route += '/24h-volume'
      } else if (filter.sortBy === 'scaledCollateralVolume') {
        route += '/volume'
      } else if (filter.sortBy === 'creationTimestamp') {
        route += '/newest'
      } else if (filter.sortBy === 'openingTimestamp') {
        route += '/ending'
      } else if (filter.sortBy === 'scaledLiquidityParameter') {
        route += '/liquidity'
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

      if (filter.state && filter.state !== 'OPEN') {
        routeQueryArray.push(`state=${filter.state}`)
      }

      if (filter.title) {
        routeQueryArray.push(`tag=${filter.title}`)
      }

      const routeQueryString = routeQueryArray.join('&')
      const routeQuery = routeQueryStart.concat(routeQueryString)

      history.push(`${route}${routeQuery}`)
    },
    [history],
  )

  return {
    updateURL,
    params: {
      state: stateParam,
      title: searchParam,
      category: categoryParam,
      sortBy: sortParam,
      sortByDirection: sortDirection,
      arbitrator: arbitratorParam,
      currency: currencyParam,
    },
  }
}
