import { useQuery } from '@apollo/react-hooks'
import { bigNumberify } from 'ethers/utils'
import React, { useCallback, useEffect, useState } from 'react'

import { useConnectedWeb3Context } from '../../../../hooks/connectedWeb3'
import { useFilters } from '../../../../hooks/useFilters'
import { useMarketFilterURLParams } from '../../../../hooks/useMarketFilterURLParams'
import { useFetchMarkets, usePaginatedList } from '../../../../hooks/useMarkets'
import { GraphMarketMakerDataItem, MarketMakerDataItem, queryCategories } from '../../../../queries/markets_home'
import { getOutcomes } from '../../../../util/networks'
import { RemoteData } from '../../../../util/remote_data'
import { CategoryDataItem, GraphResponseCategories, MarketFilters } from '../../../../util/types'

import { MarketHome } from './market_home'

const wrangleResponse = (data: GraphMarketMakerDataItem[], networkId: number): MarketMakerDataItem[] => {
  return data.map((graphMarketMakerDataItem: GraphMarketMakerDataItem) => {
    const outcomes = graphMarketMakerDataItem.outcomes
      ? graphMarketMakerDataItem.outcomes
      : getOutcomes(networkId, +graphMarketMakerDataItem.templateId)

    return {
      address: graphMarketMakerDataItem.id,
      arbitrator: graphMarketMakerDataItem.arbitrator,
      category: graphMarketMakerDataItem.category,
      collateralToken: graphMarketMakerDataItem.collateralToken,
      collateralVolume: bigNumberify(graphMarketMakerDataItem.collateralVolume),
      openingTimestamp: new Date(1000 * +graphMarketMakerDataItem.openingTimestamp),
      outcomeTokenAmounts: graphMarketMakerDataItem.outcomeTokenAmounts.map(bigNumberify),
      outcomes,
      templateId: +graphMarketMakerDataItem.templateId,
      title: graphMarketMakerDataItem.title,
      scaledLiquidityParameter: parseFloat(graphMarketMakerDataItem.scaledLiquidityParameter),
    }
  })
}

const MarketHomeContainer: React.FC = () => {
  const context = useConnectedWeb3Context()
  const { networkId } = context

  const [markets, setMarkets] = useState<RemoteData<MarketMakerDataItem[]>>(RemoteData.notAsked())
  const [categories, setCategories] = useState<RemoteData<CategoryDataItem[]>>(RemoteData.notAsked())
  const [pageSize, setPageSize] = useState(4)
  const [pageIndex, setPageIndex] = useState(0)
  const [expectedMarketsSize, setExpectedMarketsSize] = useState(pageSize)
  const { params, updateURL } = useMarketFilterURLParams()
  const { fetchMyMarkets, filter, marketsQuery, marketsQueryVariables, setFilter } = useFilters(params, pageSize)

  const [isFiltering, setIsFiltering] = useState(false)

  const { error, filteredMarkets, loading } = useFetchMarkets(
    marketsQuery,
    fetchMyMarkets,
    marketsQueryVariables,
    expectedMarketsSize,
  )
  const { moreMarkets, pageList: currentPageMarkets } = usePaginatedList<any>(filteredMarkets, pageIndex, pageSize)

  const { data: fetchedCategories, error: categoriesError, loading: categoriesLoading } = useQuery<
    GraphResponseCategories
  >(queryCategories, {
    notifyOnNetworkStatusChange: true,
  })

  useEffect(() => {
    setExpectedMarketsSize(pageSize * (pageIndex + 1))
  }, [pageSize, pageIndex])

  useEffect(() => {
    if (loading) {
      setMarkets(markets => (RemoteData.hasData(markets) ? RemoteData.reloading(markets.data) : RemoteData.loading()))
    } else if (currentPageMarkets) {
      setMarkets(RemoteData.success(wrangleResponse(currentPageMarkets, networkId)))

      setIsFiltering(false)
    } else if (error) {
      setMarkets(RemoteData.failure(error))
      setIsFiltering(false)
    }
  }, [currentPageMarkets, loading, error, networkId])

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
  }, [fetchedCategories, categoriesLoading, categoriesError])

  const onFilterChange = useCallback(
    (filter: MarketFilters) => {
      setFilter(filter)
      setPageIndex(0)
      setIsFiltering(true)
      updateURL(filter)
    },
    [setFilter, updateURL],
  )

  const loadNextPage = () => {
    if (!moreMarkets) {
      return
    }
    setPageIndex(pageIndex + 1)
  }

  const loadPrevPage = () => {
    if (pageIndex === 0) {
      return
    }
    setPageIndex(pageIndex - 1)
  }

  const updatePageSize = (size: number): void => {
    setPageSize(size)
    setPageIndex(0)
  }

  return (
    <>
      <MarketHome
        categories={categories}
        context={context}
        count={currentPageMarkets ? currentPageMarkets.length : 0}
        currentFilter={filter}
        fetchMyMarkets={fetchMyMarkets}
        isFiltering={isFiltering}
        markets={markets}
        moreMarkets={moreMarkets}
        onFilterChange={onFilterChange}
        onLoadNextPage={loadNextPage}
        onLoadPrevPage={loadPrevPage}
        onUpdatePageSize={updatePageSize}
        pageIndex={pageIndex}
      />
    </>
  )
}

export { MarketHomeContainer }
