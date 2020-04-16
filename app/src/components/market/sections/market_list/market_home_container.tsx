import { useQuery } from '@apollo/react-hooks'
import { ethers } from 'ethers'
import { bigNumberify } from 'ethers/utils'
import React, { useCallback, useEffect, useState } from 'react'
import { Waypoint } from 'react-waypoint'

import { CORONA_MARKET_CREATORS, IS_CORONA_VERSION, MARKET_FEE } from '../../../../common/constants'
import { useConnectedWeb3Context } from '../../../../hooks/connectedWeb3'
import { GraphMarketMakerDataItem, MarketMakerDataItem, buildQueryMarkets } from '../../../../queries/markets_home'
import { CPKService } from '../../../../services'
import { getLogger } from '../../../../util/logger'
import { getOutcomes } from '../../../../util/networks'
import { RemoteData } from '../../../../util/remote_data'
import { MarketFilters, MarketStates } from '../../../../util/types'

import { MarketHome } from './market_home'

const logger = getLogger('MarketHomeContainer')

const PAGE_SIZE = 10

type GraphResponse = {
  fixedProductMarketMakers: GraphMarketMakerDataItem[]
}

const wrangleResponse = (data: GraphMarketMakerDataItem[], networkId: number): MarketMakerDataItem[] => {
  return data.map((graphMarketMakerDataItem: GraphMarketMakerDataItem) => {
    const outcomes = graphMarketMakerDataItem.outcomes
      ? graphMarketMakerDataItem.outcomes
      : getOutcomes(networkId, +graphMarketMakerDataItem.templateId)

    return {
      address: graphMarketMakerDataItem.id,
      collateralVolume: bigNumberify(graphMarketMakerDataItem.collateralVolume),
      collateralToken: graphMarketMakerDataItem.collateralToken,
      outcomeTokenAmounts: graphMarketMakerDataItem.outcomeTokenAmounts.map(bigNumberify),
      title: graphMarketMakerDataItem.title,
      outcomes,
      openingTimestamp: new Date(1000 * +graphMarketMakerDataItem.openingTimestamp),
      arbitrator: graphMarketMakerDataItem.arbitrator,
      category: graphMarketMakerDataItem.category,
      templateId: +graphMarketMakerDataItem.templateId,
    }
  })
}

const MarketHomeContainer: React.FC = () => {
  const context = useConnectedWeb3Context()

  const [filter, setFilter] = useState<MarketFilters>({
    state: MarketStates.open,
    category: 'All',
    title: '',
    sortBy: null,
    arbitrator: null,
    templateId: null,
    currency: null,
  })
  const [markets, setMarkets] = useState<RemoteData<MarketMakerDataItem[]>>(RemoteData.notAsked())
  const [cpkAddress, setCpkAddress] = useState<Maybe<string>>(null)
  const [moreMarkets, setMoreMarkets] = useState(true)

  const { account, library: provider } = context

  const feeBN = ethers.utils.parseEther('' + MARKET_FEE / Math.pow(10, 2))

  const query = buildQueryMarkets({
    isCoronaVersion: IS_CORONA_VERSION,
    ...filter,
  })
  const marketsQueryVariables = {
    first: PAGE_SIZE,
    skip: 0,
    accounts: cpkAddress ? [cpkAddress] : null,
    fee: feeBN.toString(),
    ...filter,
  }
  if (IS_CORONA_VERSION) {
    marketsQueryVariables.accounts = CORONA_MARKET_CREATORS
  }
  const { data: fetchedMarkets, error, fetchMore, loading } = useQuery<GraphResponse>(query, {
    notifyOnNetworkStatusChange: true,
    variables: marketsQueryVariables,
  })

  useEffect(() => {
    const getCpkAddress = async () => {
      try {
        const cpk = await CPKService.create(provider)
        setCpkAddress(cpk.address)
      } catch (e) {
        logger.error('Could not get address of CPK', e.message)
      }
    }
    if (account) {
      getCpkAddress()
    }
  }, [provider, account])

  useEffect(() => {
    if (loading) {
      setMarkets(markets => (RemoteData.hasData(markets) ? RemoteData.reloading(markets.data) : RemoteData.loading()))
    } else if (error) {
      setMarkets(RemoteData.failure(error))
    } else if (fetchedMarkets) {
      const { fixedProductMarketMakers } = fetchedMarkets

      setMarkets(RemoteData.success(wrangleResponse(fixedProductMarketMakers, context.networkId)))
      if (fixedProductMarketMakers.length === 0) {
        setMoreMarkets(false)
      }
    }
  }, [fetchedMarkets, loading, error, context.networkId])

  const onFilterChange = useCallback((filter: any) => {
    setMoreMarkets(true)
    setFilter(filter)
  }, [])

  const loadMore = () => {
    if (!moreMarkets) return
    fetchMore({
      variables: {
        skip: fetchedMarkets && fetchedMarkets.fixedProductMarketMakers.length,
      },
      updateQuery: (prev: any, { fetchMoreResult }) => {
        setMoreMarkets(fetchMoreResult ? fetchMoreResult.fixedProductMarketMakers.length > 0 : false)
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
        onLoadMore={loadMore}
      />
      {RemoteData.is.success(markets) && moreMarkets && <Waypoint onEnter={loadMore} />}
    </>
  )
}

export { MarketHomeContainer }
