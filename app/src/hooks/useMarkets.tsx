import { useQuery } from '@apollo/react-hooks'
import _ from 'lodash'
import { useEffect, useState } from 'react'

import { asyncFilter } from '../util/async_filter'

const filterFn = <T,>(element: any): Promise<boolean> => {
  return Promise.resolve(element.id.split('')[3] > '0')
}

export const useFetchMarkets = (query: any, variables: any, expectedMarketsCount: number): any => {
  // TODO Import here to fetch data with different queries => [ids]
  // TODO Receive filters for filtering clientside
  // TODO Reset variables with effect
  const { data: markets, error, fetchMore, loading } = useQuery(query, {
    notifyOnNetworkStatusChange: true,
    variables,
  })

  const queriesAreLoading = loading
  const queriesErrors = error

  // TODO Another useQuery to complete data.
  const [filteredMarkets, setFilteredMarkets] = useState<any>([])
  const [moreMarkets, setMoreMarkets] = useState(true)

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
          if (!fetchMoreResult) {
            setMoreMarkets(false)
            return prev
          }

          // TODO Repeated markets
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

  return { filteredMarkets, moreMarkets, error: queriesErrors, loading: queriesAreLoading }
}

export const usePaginatedList = <T,>(list: T[], pageIndex: number, pageSize: number) => {
  const [pageList, setPageList] = useState<T[]>([])

  useEffect(() => {
    setPageList(list.slice(pageIndex * pageSize, pageIndex * pageSize + pageSize))
  }, [list, pageIndex, pageSize])

  return pageList
}
