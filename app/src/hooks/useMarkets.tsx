import { useEffect, useState } from 'react'

import { ConnectedWeb3Context } from './connectedWeb3'
import { useContracts } from './useContracts'
import { FEE } from '../common/constants'
import { MarketMakerService } from '../services/market_maker'
import { getLogger } from '../util/logger'
import { Market, MarketWithExtraData, MarketFilters, MarketStatus } from '../util/types'
import { RemoteData } from '../util/remote_data'
import { DisconnectedWeb3Context } from './disconnectedWeb3'

const logger = getLogger('Market::useMarkets')

export const useMarkets = (
  context: ConnectedWeb3Context | DisconnectedWeb3Context,
  filter: MarketFilters,
): {
  markets: RemoteData<MarketWithExtraData[]>
} => {
  const { marketMakerFactory, conditionalTokens, realitio } = useContracts(context)

  const [markets, setMarkets] = useState<RemoteData<MarketWithExtraData[]>>(RemoteData.loading())

  useEffect(() => {
    let isSubscribed = true

    const fetchMarkets = async () => {
      setMarkets(RemoteData.loading())

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

          const account = 'account' in context ? context.account : ''
          const marketMakerService = new MarketMakerService(
            market.address,
            conditionalTokens,
            provider,
            account,
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

        const markets = await marketMakerFactory.getMarkets(provider)
        const marketsWithExtraData = await Promise.all(markets.map(getExtraData))

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

        if (isSubscribed) setMarkets(RemoteData.success(marketsOrdered))
      } catch (error) {
        logger.error('There was an error fetching the markets data:', error.message)
        setMarkets(RemoteData.failure(error))
      }
    }

    fetchMarkets()

    return () => {
      isSubscribed = false
    }
  }, [context, marketMakerFactory, conditionalTokens, realitio, filter])

  return {
    markets,
  }
}
