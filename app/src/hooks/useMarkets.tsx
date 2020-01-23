import { useEffect, useState } from 'react'

import { ConnectedWeb3Context } from './connectedWeb3'
import { useContracts, Contracts } from './useContracts'
import { FETCH_EVENTS_CHUNK_SIZE } from '../common/constants'
import { asyncFilter } from '../util/async_filter'
import { MarketWithExtraData } from '../util/types'
import { MarketFilter } from '../util/market_filter'
import { callInChunks, Range } from '../util/call_in_chunks'
import { RemoteData } from '../util/remote_data'
import { BigNumber } from 'ethers/utils'
import { getEarliestBlockToCheck } from '../util/networks'
import { getLogger } from '../util/logger'

const logger = getLogger('Hooks::useMarkets')

const buildFilterFn = (filter: MarketFilter, contracts: Contracts) => async (
  market: MarketWithExtraData,
): Promise<boolean> => {
  const { buildMarketMaker, conditionalTokens, realitio } = contracts

  if (MarketFilter.is.allMarkets(filter)) {
    return true
  } else if (MarketFilter.is.fundedMarkets(filter)) {
    const marketMakerService = buildMarketMaker(market.address)
    const poolShares = await marketMakerService.poolSharesBalanceOf(filter.account)

    return poolShares.gt(0)
  } else if (
    MarketFilter.is.predictedOnMarkets(filter) ||
    MarketFilter.is.winningResultMarkets(filter)
  ) {
    const marketMakerService = buildMarketMaker(market.address)
    const questionId = await conditionalTokens.getQuestionId(market.conditionId)
    const { outcomes } = await realitio.getQuestion(questionId)
    const isFinalized = await realitio.isFinalized(questionId)

    const balances = await marketMakerService.getBalanceInformation(filter.account, outcomes.length)

    if (MarketFilter.is.predictedOnMarkets(filter) && !isFinalized) {
      const balancesGreaterThanZero = balances.filter((balanceBN: BigNumber) => balanceBN.gt(0))
      return balancesGreaterThanZero.length > 0
    }
    if (MarketFilter.is.winningResultMarkets(filter) && isFinalized) {
      const winnerOutcome = await realitio.getWinnerOutcome(questionId)
      const winningOutcomes = balances.filter(
        (balanceBN: BigNumber, index: number) => winnerOutcome === index && balanceBN.gt(0),
      )
      return winningOutcomes.length > 0
    }

    return false
  } else {
    const exhaustiveCheck: never = filter
    return exhaustiveCheck
  }
}

const fetchMarkets = async (
  filter: MarketFilter,
  range: Range,
  expectedMarketsCount: number,
  contracts: Contracts,
): Promise<{ markets: MarketWithExtraData[]; usedRange: Range }> => {
  const { conditionalTokens, marketMakerFactory, realitio } = contracts

  const fetchAndFilter = async (subrange: Range): Promise<MarketWithExtraData[]> => {
    const validMarkets = await marketMakerFactory.getMarketsWithExtraData(
      {
        from: subrange[0],
        to: subrange[1],
      },
      conditionalTokens,
      realitio,
    )

    const filterFn = buildFilterFn(filter, contracts)
    const filteredMarkets = await asyncFilter(validMarkets, filterFn)

    return filteredMarkets
  }

  const [marketsPage, usedRange] = await callInChunks(fetchAndFilter, range, {
    callUntil: result => result.length >= expectedMarketsCount,
    chunkSize: FETCH_EVENTS_CHUNK_SIZE,
    delay: 100,
  })

  const marketsOrdered = marketsPage.sort(
    (marketA: MarketWithExtraData, marketB: MarketWithExtraData) => {
      if (marketA.resolution && marketB.resolution) {
        return marketB.resolution.getTime() - marketA.resolution.getTime()
      }
      return 0
    },
  )

  return { markets: marketsOrdered, usedRange }
}

export const useMarkets = (
  context: ConnectedWeb3Context,
  filter: MarketFilter,
  expectedMarketsCount: number,
): {
  markets: RemoteData<MarketWithExtraData[]>
  moreMarkets: boolean
} => {
  const contracts = useContracts(context)

  const [markets, setMarkets] = useState<RemoteData<MarketWithExtraData[]>>(RemoteData.loading())
  const [latestBlockToCheck, setLatestBlockTocheck] = useState<Maybe<number>>(null)
  const [moreMarkets, setMoreMarkets] = useState(true)
  const [needFetchMore, setNeedFetchMore] = useState(true)

  const earliestBlockToCheck = getEarliestBlockToCheck(context.networkId)
  logger.debug(`Earliest block to check ${earliestBlockToCheck}`)

  useEffect(() => {
    setMoreMarkets(latestBlockToCheck === null || latestBlockToCheck > earliestBlockToCheck)
  }, [latestBlockToCheck, earliestBlockToCheck])

  // Set `needFetchMore` to true when it makes sense to fetch more markets
  useEffect(() => {
    if (
      RemoteData.is.success(markets) &&
      markets.data.length < expectedMarketsCount &&
      moreMarkets
    ) {
      setNeedFetchMore(true)
    }
  }, [markets, moreMarkets, expectedMarketsCount])

  // restart values when the filter changes
  useEffect(() => {
    let didCancel = false

    const run = async () => {
      if (!didCancel) {
        const blockNumber = await context.library.getBlockNumber()
        setMarkets(RemoteData.notAsked())
        setLatestBlockTocheck(blockNumber)
        setNeedFetchMore(true)
      }
    }
    run()

    return () => {
      didCancel = true
    }
  }, [context, filter])

  // fetch markets
  useEffect(() => {
    let didCancel = false

    const run = async (range: Range) => {
      try {
        setMarkets(markets =>
          RemoteData.hasData(markets) ? RemoteData.reloading(markets.data) : RemoteData.loading(),
        )
        const result = await fetchMarkets(filter, range, expectedMarketsCount, contracts)

        if (!didCancel) {
          setNeedFetchMore(false)
          setLatestBlockTocheck(result.usedRange[0] - 1)
          setMarkets(currentMarkets =>
            RemoteData.hasData(currentMarkets)
              ? RemoteData.success(currentMarkets.data.concat(result.markets))
              : RemoteData.success(result.markets),
          )
        }
      } catch (e) {
        if (!didCancel) {
          setMarkets(RemoteData.failure(e))
        }
      }
    }

    if (latestBlockToCheck && needFetchMore) {
      run([earliestBlockToCheck, latestBlockToCheck])
    }

    return () => {
      didCancel = true
    }
  }, [
    context,
    filter,
    latestBlockToCheck,
    earliestBlockToCheck,
    expectedMarketsCount,
    needFetchMore,
    contracts,
  ])

  return {
    markets,
    moreMarkets,
  }
}
