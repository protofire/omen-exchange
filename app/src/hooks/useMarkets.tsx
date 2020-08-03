import { useQuery } from '@apollo/react-hooks'
import _ from 'lodash'
import { useEffect, useState } from 'react'

import { asyncFilter } from '../util/async_filter'

// TODO
// This filter should work for fields that cannot be lifted
const filterFn = <T,>(element: any): Promise<boolean> => {
  return Promise.resolve(element.id.split('')[3] > '0')
}

export const useFetchMarkets = (query: any, variables: any, expectedMarketsCount: number): any => {
  // TODO Import here to fetch data with different queries => Response should be a list of fpmm ids
  // TODO Receive filters for filtering clientside after the graph filter/sort in subgraph side
  const { data: markets, error, fetchMore, loading } = useQuery(query, {
    notifyOnNetworkStatusChange: true,
    fetchPolicy: 'network-only',
    variables,
  })

  // TODO We need two queries here, the one for ids and another one for retrieving fpmm data of each id
  // loading and error should be combined
  const queriesAreLoading = loading
  const queriesErrors = error

  const [filteredMarkets, setFilteredMarkets] = useState<any>([])

  useEffect((): (() => void) => {
    let didCancel = false
    const filterMarkets = async () => {
      const filteredMarkets = await asyncFilter<any>(markets.fixedProductMarketMakers, filterFn)
      setFilteredMarkets(filteredMarkets)
    }
    if (markets && !didCancel && !queriesAreLoading) filterMarkets()
    return () => (didCancel = true)
  }, [markets, queriesAreLoading])

  useEffect(() => {
    if (!queriesAreLoading && filteredMarkets && filteredMarkets.length < expectedMarketsCount) {
      const skip = markets ? markets.fixedProductMarketMakers.length : 0

      fetchMore({
        variables: {
          skip,
        },
        updateQuery: (prev, { fetchMoreResult }) => {
          if (!fetchMoreResult || fetchMoreResult.fixedProductMarketMakers.length === 0) {
            return prev
          }

          // TODO Repeated markets. This add lodash as dependency, should be removed when a bug related
          // repeated markets in result is solved.
          const result = Object.assign({}, prev, {
            fixedProductMarketMakers: _.uniqBy(
              [...prev.fixedProductMarketMakers, ...fetchMoreResult.fixedProductMarketMakers],
              'id',
            ),
          })

          return result
        },
      })
    }
  }, [queriesAreLoading, markets, filteredMarkets, fetchMore, expectedMarketsCount])

  return { filteredMarkets, error: queriesErrors, loading: queriesAreLoading }
}

export const usePaginatedList = <T,>(list: T[], pageIndex: number, pageSize: number) => {
  const [pageList, setPageList] = useState<T[]>([])
  const [moreMarkets, setMoreMarkets] = useState(true)

  useEffect(() => {
    setMoreMarkets(list.length > pageIndex * pageSize)
    setPageList(list.slice(pageIndex * pageSize, pageIndex * pageSize + pageSize))
  }, [list, pageIndex, pageSize])

  return { pageList, moreMarkets }
}
