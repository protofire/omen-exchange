import { useEffect, useState } from 'react'

import { ConnectedWeb3Context } from './connectedWeb3'
import { useContracts } from './useContracts'
import { FEE } from '../common/constants'
import { MarketMakerService } from '../services/market_maker'
import { getLogger } from '../util/logger'
import { MarketWithExtraData, MarketFilters } from '../util/types'
import { callInChunks } from '../util/call_in_chunks'
import { RemoteData } from '../util/remote_data'
import { DisconnectedWeb3Context } from './disconnectedWeb3'

const EARLIEST_BLOCK_EVENTS = 5279938

const logger = getLogger('Market::useMarkets')

export const useMarkets = (
  context: ConnectedWeb3Context | DisconnectedWeb3Context,
  filter: MarketFilters,
  expectedMarketsCount: number,
): {
  markets: RemoteData<MarketWithExtraData[]>
  moreMarkets: boolean
} => {
  const { marketMakerFactory, conditionalTokens, realitio } = useContracts(context)

  const [markets, setMarkets] = useState<RemoteData<MarketWithExtraData[]>>(RemoteData.loading())
  const [moreMarkets, setMoreMarkets] = useState(true)

  useEffect(() => {
    let didCancel = false

    const fetchMarkets = async () => {
      setMarkets(RemoteData.loading())
      try {
        const provider = context.library

        const rangeEnd: number = await provider.getBlockNumber()

        const fetchAndFilter = async (
          subrange: [number, number],
        ): Promise<MarketWithExtraData[]> => {
          const markets = await marketMakerFactory.getMarkets(provider, {
            from: subrange[0],
            to: subrange[1],
          })
          const marketsWithExtraData = await Promise.all(
            markets.map(market => {
              const marketMaker = new MarketMakerService(
                market.address,
                conditionalTokens,
                realitio,
                provider,
              )
              return marketMaker.getExtraData(market)
            }),
          )

          const validMarkets = marketsWithExtraData.filter(market => market.fee.eq(FEE))

          let filteredMarkets = validMarkets
          if ('account' in context) {
            if (filter === MarketFilters.MyMarkets) {
              filteredMarkets = validMarkets.filter(
                market => market.ownerAddress === context.account,
              )
            } else if (filter === MarketFilters.FundedMarkets) {
              filteredMarkets = []
              for (const market of validMarkets) {
                const marketMakerService = new MarketMakerService(
                  market.address,
                  conditionalTokens,
                  realitio,
                  provider,
                )
                const poolShares = await marketMakerService.poolSharesBalanceOf(context.account)
                if (poolShares.gt(0)) {
                  filteredMarkets.push(market)
                }
              }
            }
          }
          return filteredMarkets
        }
        const [marketsPage, usedRange] = await callInChunks(
          fetchAndFilter,
          [EARLIEST_BLOCK_EVENTS, rangeEnd],
          {
            callUntil: async result => {
              return result.length >= expectedMarketsCount
            },
            chunkSize: 20000,
            delay: 100,
          },
        )

        const marketsOrdered = marketsPage.sort(
          (marketA: MarketWithExtraData, marketB: MarketWithExtraData) => {
            if (marketA.resolution && marketB.resolution) {
              return marketB.resolution.getTime() - marketA.resolution.getTime()
            }
            return 0
          },
        )

        // don't set new values if effect was cancelled
        if (didCancel) {
          return
        }

        setMarkets(RemoteData.success(marketsOrdered.slice(0, expectedMarketsCount)))

        setMoreMarkets(usedRange[0] > EARLIEST_BLOCK_EVENTS)
      } catch (error) {
        // don't set new values if effect was cancelled
        if (didCancel) {
          return
        }
        logger.error('There was an error fetching the markets data:', error.message)
        setMarkets(RemoteData.failure(error))
      }
    }

    fetchMarkets()

    return () => {
      didCancel = true
    }
  }, [context, filter, expectedMarketsCount, conditionalTokens, realitio, marketMakerFactory])

  return {
    markets,
    moreMarkets,
  }
}
