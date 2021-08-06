import { useQuery } from '@apollo/react-hooks'
import { useEffect, useState } from 'react'

import { useConnectedWeb3Context } from '../../contexts'
import { buildQueryMarkets, buildQueryMyMarkets } from '../../queries/markets_home'
import { multicall } from '../../util/multicall'
import {
  BuildQueryType,
  GraphMarketMakerDataItem,
  GraphResponseMarkets,
  GraphResponseMarketsGeneric,
  GraphResponseMyMarkets,
  MarketFilters,
  MarketStates,
} from '../../util/types'

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

const totalSuppyFnSig = 'totalSupply()(uint256)'

const normalizeFetchedData = (data: GraphResponseMyMarkets): GraphMarketMakerDataItem[] => {
  return data && data.account ? data.account.fpmmParticipations.map(fpmm => fpmm.fixedProductMarketMakers) : []
}

export const useMarkets = (options: Options): any => {
  const { networkId } = useConnectedWeb3Context()

  const {
    arbitrator,
    category,
    curationSource,
    currency,
    first,
    skip: skipFromOptions,
    sortBy,
    sortByDirection,
    state,
    templateId,
    title,
  } = options

  const [internalLoading, setInternalLoading] = useState(true)
  const [moreMarkets, setMoreMarkets] = useState(true)
  const [markets, setMarkets] = useState<GraphResponseMarketsGeneric>({ fixedProductMarketMakers: [] })

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
    curationSource,
  }

  const marketQuery = buildQueryMarkets(queryOptions)
  const myMarketsQuery = buildQueryMyMarkets(queryOptions)
  const query = fetchMyMarkets ? myMarketsQuery : marketQuery

  const newOptions = { ...options, first: first + 1 }

  const { error, fetchMore, loading } = useQuery<GraphResponseMarkets>(query, {
    notifyOnNetworkStatusChange: true,
    variables: newOptions,
    // loading stuck on true when using useQuery hook , using a fetchPolicy seems to fix it
    // If you do not want to risk displaying any out-of-date information from the cache,
    // it may make sense to use a ‘network-only’ fetch policy.
    // This policy favors showing the most up-to-date information over quick responses.
    fetchPolicy: 'network-only',
    onCompleted: async (data: GraphResponseMarkets) => {
      let internalMarkets: GraphMarketMakerDataItem[] = []
      if (fetchMyMarkets) {
        internalMarkets = normalizeFetchedData(data as GraphResponseMyMarkets)
      } else {
        const marketsGeneric = data as GraphResponseMarketsGeneric
        internalMarkets = marketsGeneric.fixedProductMarketMakers
      }

      setMoreMarkets(internalMarkets.length === first + 1)
      if (internalMarkets.length === first + 1) {
        internalMarkets = internalMarkets.slice(0, first)
      }
      if (internalMarkets && internalMarkets.length === 0 && skipFromOptions === 0) {
        setMarkets({
          fixedProductMarketMakers: [],
        })
      } else {
        const calls = internalMarkets.map(({ id }) => ({
          target: id,
          call: [totalSuppyFnSig],
          returns: [[`${id}-totalPoolShares`]],
        }))

        const response = await multicall(calls, networkId)

        internalMarkets = internalMarkets.map(market => ({
          ...market,
          totalPoolShares: response.results.transformed[`${market.id}-totalPoolShares`],
        }))

        setMarkets({
          fixedProductMarketMakers: internalMarkets,
        })
      }

      setInternalLoading(false)
    },
    onError: () => setInternalLoading(false),
  })

  useEffect(() => {
    if (loading) {
      setInternalLoading(true)
      setMarkets({
        fixedProductMarketMakers: [],
      })
    }
  }, [loading])

  useEffect(() => {
    setMarkets({
      fixedProductMarketMakers: [],
    })
  }, [arbitrator, currency, curationSource, category, state, sortBy, templateId])

  return { markets, error, fetchMore, loading: internalLoading, moreMarkets }
}
