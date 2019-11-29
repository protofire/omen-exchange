import { useEffect, useState } from 'react'

import { ConnectedWeb3Context } from './connectedWeb3'
import { useContracts, Contracts } from './useContracts'
import { MarketWithExtraData, MarketFilters } from '../util/types'
import { callInChunks } from '../util/call_in_chunks'
import { RemoteData } from '../util/remote_data'

const EARLIEST_BLOCK_EVENTS = 4986777

const fetchMarkets = async (
  account: Maybe<string>,
  filter: MarketFilters,
  range: [number, number],
  expectedMarketsCount: number,
  contracts: Contracts,
): Promise<{ markets: MarketWithExtraData[]; usedRange: [number, number] }> => {
  const { conditionalTokens, marketMakerFactory, realitio } = contracts

  const fetchAndFilter = async (subrange: [number, number]): Promise<MarketWithExtraData[]> => {
    const validMarkets = await marketMakerFactory.getMarketsWithExtraData(
      {
        from: subrange[0],
        to: subrange[1],
      },
      conditionalTokens,
      realitio,
    )

    let filteredMarkets = validMarkets
    if (account) {
      if (filter === MarketFilters.MyMarkets) {
        filteredMarkets = validMarkets.filter(market => market.ownerAddress === account)
      } else if (filter === MarketFilters.FundedMarkets) {
        filteredMarkets = []
        for (const market of validMarkets) {
          const marketMakerService = marketMakerFactory.buildMarketMaker(
            market.address,
            conditionalTokens,
            realitio,
          )
          const poolShares = await marketMakerService.poolSharesBalanceOf(account)
          if (poolShares.gt(0)) {
            filteredMarkets.push(market)
          }
        }
      }
    }

    return filteredMarkets
  }

  const [marketsPage, usedRange] = await callInChunks(fetchAndFilter, range, {
    callUntil: async result => {
      return result.length >= expectedMarketsCount
    },
    chunkSize: 20000,
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
  filter: MarketFilters,
  expectedMarketsCount: number,
): {
  markets: RemoteData<MarketWithExtraData[]>
  moreMarkets: boolean
} => {
  const contracts = useContracts(context)

  const [markets, setMarkets] = useState<RemoteData<MarketWithExtraData[]>>(RemoteData.loading())
  const [latestCheckedBlock, setLatestCheckedBlock] = useState<Maybe<number>>(null)
  const [moreMarkets, setMoreMarkets] = useState(true)
  const [needFetchMore, setNeedFetchMore] = useState(true)

  useEffect(() => {
    setMoreMarkets(latestCheckedBlock === null || latestCheckedBlock > EARLIEST_BLOCK_EVENTS)
  }, [latestCheckedBlock])

  useEffect(() => {
    if (
      RemoteData.is.success(markets) &&
      markets.data.length < expectedMarketsCount &&
      moreMarkets
    ) {
      setNeedFetchMore(true)
    }
  }, [markets, moreMarkets, expectedMarketsCount])

  useEffect(() => {
    const run = async () => {
      const blockNumber = await context.library.getBlockNumber()
      setMarkets(RemoteData.notAsked())
      setLatestCheckedBlock(blockNumber)
      setNeedFetchMore(true)
    }
    run()
  }, [context, filter])

  useEffect(() => {
    let didCancel = false

    const run = async (range: [number, number]) => {
      try {
        setMarkets(markets =>
          RemoteData.hasData(markets) ? RemoteData.reloading(markets.data) : RemoteData.loading(),
        )
        const result = await fetchMarkets(
          context.account,
          filter,
          range,
          expectedMarketsCount,
          contracts,
        )

        if (!didCancel) {
          setNeedFetchMore(false)
          setLatestCheckedBlock(result.usedRange[0] - 1)
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

    if (latestCheckedBlock && needFetchMore) {
      run([EARLIEST_BLOCK_EVENTS, latestCheckedBlock])
    }

    return () => {
      didCancel = true
    }
  }, [context, filter, latestCheckedBlock, expectedMarketsCount, needFetchMore, contracts])

  return {
    markets,
    moreMarkets,
  }
}
