import { useQuery } from '@apollo/react-hooks'
import filter from 'lodash.filter'
import unionBy from 'lodash.unionby'
import React from 'react'

import { buildQueryMarkets, queryMyMarkets } from '../queries/markets_home'
import {
  BuildQueryType,
  GraphMarketMakerDataItem,
  GraphResponseMarkets,
  GraphResponseMarketsGeneric,
  GraphResponseMyMarkets,
  MarketFilters,
  MarketStates,
  MarketValidity,
} from '../util/types'

import { useConnectedWeb3Context } from './connectedWeb3'

interface MarketVariables {
  first: number
  skip: number
  accounts: Maybe<string[]>
  account: Maybe<string>
  fee: string
  now: number
  knownArbitrators: string[]
}

type Options = MarketVariables & MarketFilters

const normalizeFetchedData = (data: GraphResponseMyMarkets): GraphMarketMakerDataItem[] => {
  return data && data.account ? data.account.fpmmParticipations.map(fpmm => fpmm.fixedProductMarketMakers) : []
}

export const useMarkets = (options: Options, expectedMarketSize: number): any => {
  const { networkId } = useConnectedWeb3Context()

  const {
    arbitrator,
    category,
    currency,
    first,
    marketValidity,
    skip: skipFromOptions,
    sortBy,
    sortByDirection,
    state,
    templateId,
    title,
  } = options

  const [retry, setRetry] = React.useState(3)
  const [notTheFirstOne, setNotTheFirstOne] = React.useState(false)

  const [moreMarkets, setMoreMarkets] = React.useState(true)

  const [markets, setMarkets] = React.useState<GraphResponseMarketsGeneric>({ fixedProductMarketMakers: [] })
  const [marketsNormalized, setMarketsNormalized] = React.useState<GraphMarketMakerDataItem[]>([])

  const fetchMyMarkets = state === MarketStates.myMarkets
  const queryOptions: BuildQueryType = {
    whitelistedCreators: false,
    whitelistedTemplateIds: true,
    networkId,
    state,
    category,
    title,
    sortBy,
    sortByDirection,
    arbitrator,
    templateId,
    currency,
    marketValidity,
  }

  const marketQuery = buildQueryMarkets(queryOptions)
  const query = fetchMyMarkets ? queryMyMarkets : marketQuery

  const { error, fetchMore, loading } = useQuery<GraphResponseMarkets>(query, {
    notifyOnNetworkStatusChange: true,
    variables: options,
    // loading stuck on true when using useQuery hook , using a fetchPolicy seems to fix it
    // If you do not want to risk displaying any out-of-date information from the cache,
    // it may make sense to use a ‘network-only’ fetch policy.
    // This policy favors showing the most up-to-date information over quick responses.
    fetchPolicy: 'network-only',
    onCompleted: (data: GraphResponseMarkets) => {
      if (fetchMyMarkets) {
        const marketsFromOrigin: GraphMarketMakerDataItem[] = normalizeFetchedData(data as GraphResponseMyMarkets)

        const internalMarkets: GraphMarketMakerDataItem[] = filter(marketsFromOrigin, marketMaker => {
          let marketValiditycheck = true
          let currencyCheck = true
          let arbitratorCheck = true

          if (marketValidity) {
            marketValiditycheck =
              marketValidity === MarketValidity.VALID
                ? marketMaker.curatedByDxDao === true
                : marketMaker.curatedByDxDao === false
          }

          if (currency) {
            currencyCheck = marketMaker.collateralToken.toLowerCase() === currency.toLowerCase()
          }

          if (arbitrator) {
            arbitratorCheck = marketMaker.arbitrator.toLowerCase() === arbitrator.toLowerCase()
          }

          return marketValiditycheck && currencyCheck && arbitratorCheck
        })

        if (marketsNormalized.length + internalMarkets.length <= first) {
          const markets =
            marketsNormalized.length > 0 ? unionBy(marketsNormalized, internalMarkets, 'id') : internalMarkets
          setMarketsNormalized(markets)
        } else {
          setMarketsNormalized(internalMarkets)
        }

        const moreMarkets = internalMarkets.length <= first && marketsFromOrigin.length === first

        setMoreMarkets(moreMarkets)
        setNotTheFirstOne(true)
      } else {
        const marketsGeneric = data as GraphResponseMarketsGeneric
        const internalMarkets: GraphMarketMakerDataItem[] = marketsGeneric.fixedProductMarketMakers

        if (internalMarkets && internalMarkets.length === 0 && skipFromOptions === 0) {
          setMarketsNormalized([])
        } else if (marketsNormalized.length + internalMarkets.length <= first) {
          const markets =
            marketsNormalized.length > 0 ? unionBy(marketsNormalized, internalMarkets, 'id') : internalMarkets
          setMarketsNormalized(markets)
        } else {
          setMarketsNormalized(internalMarkets)
        }
        setMoreMarkets(internalMarkets.length === first)
      }
    },
  })

  React.useEffect(() => {
    setMarketsNormalized([])
    setRetry(3)
    setNotTheFirstOne(false)
  }, [arbitrator, currency, marketValidity, category, state])

  React.useEffect(() => {
    const needsMoreMarkets = marketsNormalized.length < expectedMarketSize && moreMarkets
    if (needsMoreMarkets && fetchMyMarkets && notTheFirstOne && retry > 0) {
      setRetry(retry - 1)
      fetchMore({
        variables: {
          skip: skipFromOptions + first,
        },
        updateQuery: (prev, { fetchMoreResult }) => {
          return fetchMoreResult || prev
        },
      })
    }

    setMarkets({
      fixedProductMarketMakers: marketsNormalized,
    })
  }, [
    marketsNormalized,
    fetchMore,
    expectedMarketSize,
    moreMarkets,
    fetchMyMarkets,
    notTheFirstOne,
    retry,
    skipFromOptions,
    first,
  ])

  return { markets, error, fetchMore, loading, moreMarkets }
}
