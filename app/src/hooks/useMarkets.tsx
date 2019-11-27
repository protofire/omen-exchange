import { useCallback, useEffect, useState } from 'react'

import { ConnectedWeb3Context } from './connectedWeb3'
import { useContracts } from './useContracts'
import { FEE } from '../common/constants'
import { MarketMakerService } from '../services/market_maker'
import { getLogger } from '../util/logger'
import { Market, MarketWithExtraData, MarketFilters, MarketStatus } from '../util/types'
import { callInChunks } from '../util/call_in_chunks'
import { RemoteData } from '../util/remote_data'
import { DisconnectedWeb3Context } from './disconnectedWeb3'

const EARLIEST_BLOCK_EVENTS = 1

const logger = getLogger('Market::useMarkets')

export const useMarkets = (
  context: ConnectedWeb3Context | DisconnectedWeb3Context,
  filter: MarketFilters,
  marketCount: number,
): {
  markets: RemoteData<MarketWithExtraData[]>
  moreMarkets: boolean
} => {
  const { marketMakerFactory, conditionalTokens, realitio } = useContracts(context)

  const [markets, setMarkets] = useState<RemoteData<MarketWithExtraData[]>>(RemoteData.loading())
  const [lastBlockChecked, setLastBlockChecked] = useState<Maybe<number>>(null)
  const [moreMarkets, setMoreMarkets] = useState(true)

  const fetchMarkets = useCallback(async () => {
    // don't do anything if the markets already has enough data
    if (RemoteData.hasData(markets) && markets.data.length >= marketCount) {
      return
    }

    // set the data as refreshing if it's already loaded
    if (RemoteData.is.success(markets)) {
      setMarkets(RemoteData.reloading(markets.data))
    } else {
      setMarkets(RemoteData.loading())
    }

    try {
      const provider = context.library

      const getExtraData = async (market: Market): Promise<MarketWithExtraData> => {
        const { conditionId } = market
        // Get question data
        const questionId = await conditionalTokens.getQuestionId(conditionId)
        const { question, resolution, arbitratorAddress, category } = await realitio.getQuestion(
          questionId,
        )
        // Know if a market is open or resolved
        const isConditionResolved = await conditionalTokens.isConditionResolved(conditionId)
        const marketStatus = isConditionResolved ? MarketStatus.Resolved : MarketStatus.Open

        const marketMakerService = new MarketMakerService(
          market.address,
          conditionalTokens,
          provider,
        )

        const fee = await marketMakerService.getFee()

        return {
          ...market,
          question,
          resolution,
          category,
          arbitratorAddress,
          status: marketStatus,
          fee,
        }
      }

      const rangeEnd: number = lastBlockChecked
        ? lastBlockChecked - 1
        : await provider.getBlockNumber()

      const f = async (subrange: [number, number]): Promise<Market[]> => {
        return marketMakerFactory.getMarkets(provider, { from: subrange[0], to: subrange[1] })
      }
      const [marketsPage, usedRange] = await callInChunks(f, [EARLIEST_BLOCK_EVENTS, rangeEnd], {
        callUntil: x => x.length + RemoteData.getDataOr(markets, []).length >= marketCount,
        chunkSize: 200000,
        delay: 100,
      })

      setMoreMarkets(usedRange[0] > EARLIEST_BLOCK_EVENTS)

      const marketsWithExtraData = await Promise.all(marketsPage.map(getExtraData))

      const validMarkets = marketsWithExtraData.filter(market => market.fee.eq(FEE))

      let filteredMarkets = validMarkets
      if ('account' in context) {
        if (filter === MarketFilters.MyMarkets) {
          filteredMarkets = validMarkets.filter(market => market.ownerAddress === context.account)
        } else if (filter === MarketFilters.FundedMarkets) {
          filteredMarkets = []
          for (const market of validMarkets) {
            const marketMakerService = new MarketMakerService(
              market.address,
              conditionalTokens,
              provider,
            )
            const poolShares = await marketMakerService.poolSharesBalanceOf(context.account)
            if (poolShares.gt(0)) {
              filteredMarkets.push(market)
            }
          }
        }
      }

      const marketsOrdered = filteredMarkets.sort(
        (marketA: MarketWithExtraData, marketB: MarketWithExtraData) => {
          if (marketA.resolution && marketB.resolution) {
            return marketB.resolution.getTime() - marketA.resolution.getTime()
          }
          return 0
        },
      )

      setMarkets(current => {
        if (RemoteData.hasData(current)) {
          return RemoteData.success(current.data.concat(marketsOrdered))
        }
        return RemoteData.success(marketsOrdered)
      })

      setLastBlockChecked(usedRange[0])
    } catch (error) {
      logger.error('There was an error fetching the markets data:', error.message)
      setMarkets(RemoteData.failure(error))
    }
  }, [marketCount])

  useEffect(() => {
    fetchMarkets()
  }, [fetchMarkets])

  return {
    markets,
    moreMarkets,
  }
}
