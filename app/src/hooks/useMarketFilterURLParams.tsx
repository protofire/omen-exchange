import { useCallback, useEffect, useState } from 'react'
import { useHistory } from 'react-router'
import { useLocation } from 'react-router-dom'

import { MarketFilters, MarketStates, MarketsSortCriteria } from '../util/types'

export const useMarketFilterURLParams = () => {
  const history = useHistory()
  const location = useLocation()

  const [stateParam, setStateParam] = useState<MarketStates>(MarketStates.open)
  const [categoryParam, setCategoryParam] = useState('All')
  const [searchParam, setSearchParam] = useState('')
  const [sortParam, setSortParam] = useState<MarketsSortCriteria>('lastActiveDayAndScaledRunningDailyVolume')
  const [sortDirection, setSortDirection] = useState<'desc' | 'asc'>('desc')
  const [arbitratorParam, setArbitratorParam] = useState<Maybe<string>>(null)
  const [currencyParam, setCurrencyParam] = useState<Maybe<string>>(null)

  useEffect(() => {
    const currencyFilter = location.pathname.includes('currency')
    let currencyRoute = location.pathname.split('/currency/')[1]
    if (currencyRoute) currencyRoute = currencyRoute.split('/')[0]

    if (currencyFilter) {
      setCurrencyParam(currencyRoute)
    } else {
      setCurrencyParam(null)
    }
  }, [location])

  useEffect(() => {
    const arbitratorFilter = location.pathname.includes('arbitrator')
    let arbitratorRoute = location.pathname.split('/arbitrator/')[1]
    if (arbitratorRoute) arbitratorRoute = arbitratorRoute.split('/')[0]

    if (arbitratorFilter) {
      setArbitratorParam(arbitratorRoute)
    } else {
      setArbitratorParam(null)
    }
  }, [location])

  useEffect(() => {
    const categoryFilter = location.pathname.includes('category')
    let categoryRoute = location.pathname.split('/category/')[1]
    if (categoryRoute) categoryRoute = categoryRoute.split('/')[0]

    if (categoryFilter) {
      setCategoryParam(categoryRoute)
    } else {
      setCategoryParam('All')
    }
  }, [location])

  useEffect(() => {
    const stateFilter = location.search.includes('state')
    let stateRoute = location.search.split('state=')[1]
    if (stateRoute) stateRoute = stateRoute.split('&')[0]

    if (stateFilter) {
      if (stateRoute === 'OPEN') setStateParam(MarketStates.open)
      if (stateRoute === 'PENDING') setStateParam(MarketStates.pending)
      if (stateRoute === 'CLOSED') setStateParam(MarketStates.closed)
      if (stateRoute === 'MY_MARKETS') setStateParam(MarketStates.myMarkets)
    } else {
      setStateParam(MarketStates.open)
    }
  }, [location])

  useEffect(() => {
    const searchFilter = location.search.includes('tag')
    let searchRoute = location.search.split('tag=')[1]
    if (searchRoute) searchRoute = searchRoute.split('&')[0]

    if (searchFilter) {
      setSearchParam(searchRoute)
    } else {
      setSearchParam('')
    }
  }, [location])

  useEffect(() => {
    const sortRoute = location.pathname.split('/')[1]

    if (sortRoute === '24h-volume') {
      setSortParam('lastActiveDayAndScaledRunningDailyVolume')
    } else if (sortRoute === 'volume') {
      setSortParam('scaledCollateralVolume')
    } else if (sortRoute === 'newest') {
      setSortParam('creationTimestamp')
    } else if (sortRoute === 'ending') {
      setSortParam('openingTimestamp')
      setSortDirection('asc')
    } else if (sortRoute === 'liquidity') {
      setSortParam('scaledLiquidityParameter')
    }
  }, [location])

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
