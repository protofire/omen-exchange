import { useQuery } from '@apollo/react-hooks'
import _ from 'lodash'
import { useEffect, useState } from 'react'

import { GraphMarketMakerDataItem } from '../queries/markets_home'
import { asyncFilter } from '../util/async_filter'

import { useWrangleMarkets } from './useWrangleMarkets'

type Participations = { fixedProductMarketMakers: GraphMarketMakerDataItem }
export type GraphResponseMyMarkets = { account: { fpmmParticipations: Participations[] } }
export type GraphResponseMarketsGeneric = {
  fixedProductMarketMakers: GraphMarketMakerDataItem[]
}

export type GraphResponseMarkets = GraphResponseMarketsGeneric | GraphResponseMyMarkets

// TODO
// This filter should work for fields that cannot be lifted
const filterFn = <T,>(element: any): Promise<boolean> => {
  return Promise.resolve(element.id.split('')[3] > '0')
}

export const useFetchMarkets = (
  query: any,
  fetchMyMarkets: boolean,
  variables: any,
  expectedMarketsCount: number,
): any => {
  // TODO Import here to fetch data with different queries => Response should be a list of fpmm ids
  // TODO Receive filters for filtering clientside after the graph filter/sort in subgraph side

  console.log('useFetchMarkets')
  const [moreMarkets, setMoreMarkets] = useState(true)
  const [skip, setSkip] = useState(0)
  const [filteredMarkets, setFilteredMarkets] = useState<any>([])
  const [needsMoreMarkets, setNeedsMoreMarkets] = useState(true)
  const { data: markets, error, fetchMore, loading } = useQuery<GraphResponseMarketsGeneric>(query, {
    notifyOnNetworkStatusChange: true,
    fetchPolicy: 'network-only',
    variables,
  })
  const { data, error: wrangleError, loading: wrangleLoading } = useWrangleMarkets(markets, fetchMyMarkets)

  // TODO We need two queries here, the one for ids and another one for retrieving fpmm data of each id
  // loading and error should be combined
  const queriesAreLoading = loading || wrangleError
  const queriesErrors = error || wrangleLoading

  useEffect(() => {
    console.log('RESET STATE')
    setMoreMarkets(true)
    setSkip(0)
    setNeedsMoreMarkets(true)
  }, [query])

  useEffect(() => {
    if (markets && !queriesAreLoading) {
      const skip = markets.fixedProductMarketMakers.length
      setMoreMarkets(skip > 0)
      setSkip(skip)
    }
  }, [markets, queriesAreLoading])

  useEffect((): (() => void) => {
    let didCancel = false
    const filterMarkets = async (markets: GraphResponseMarketsGeneric) => {
      const filteredMarkets = await asyncFilter<GraphMarketMakerDataItem>(markets.fixedProductMarketMakers, filterFn)
      setFilteredMarkets(filteredMarkets)
    }
    if (markets && !didCancel) filterMarkets(markets)
    return () => (didCancel = true)
  }, [markets])

  useEffect(() => {
    if (filteredMarkets && filteredMarkets.length < expectedMarketsCount) {
      setNeedsMoreMarkets(true)
    } else {
      setNeedsMoreMarkets(false)
    }
  }, [filteredMarkets, expectedMarketsCount])

  useEffect(() => {
    if (needsMoreMarkets && moreMarkets) {
      fetchMore({
        variables: {
          skip,
        },
        updateQuery: (prev, { fetchMoreResult }) => {
          if (!fetchMoreResult || fetchMoreResult.fixedProductMarketMakers.length === 0) {
            return prev
          }

          // TODO Repeated markets. This add lodash as dependency, should be removed when a bug related
          // to repeated markets in result is solved.
          const newMarkets = [...prev.fixedProductMarketMakers, ...fetchMoreResult.fixedProductMarketMakers]

          const result = Object.assign({}, prev, {
            fixedProductMarketMakers: _.uniqBy(newMarkets, 'id'),
          })

          return result
        },
      })
    }
  }, [moreMarkets, needsMoreMarkets, skip, fetchMore])

  return { filteredMarkets, error: queriesErrors, loading: queriesAreLoading }
}

export const usePaginatedList = <T,>(list: T[], pageIndex: number, pageSize: number) => {
  const [pageList, setPageList] = useState<T[]>([])
  const [moreMarkets, setMoreMarkets] = useState(true)

  useEffect(() => {
    setMoreMarkets(list.length >= (pageIndex + 1) * pageSize)
    setPageList(list.slice(pageIndex * pageSize, pageIndex * pageSize + pageSize))
  }, [list, pageIndex, pageSize])

  return { pageList, moreMarkets }
}
