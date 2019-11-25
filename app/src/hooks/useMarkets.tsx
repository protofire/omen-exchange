import { useEffect, useState } from 'react'

import { ConnectedWeb3Context } from './connectedWeb3'
import { useContracts } from './useContracts'
import { FEE } from '../common/constants'
import { MarketMakerService } from '../services/market_maker'
import { getLogger } from '../util/logger'
import { Market, MarketWithExtraData, MarketStatus, Status } from '../util/types'
import { DisconnectedWeb3Context } from './disconnectedWeb3'

const logger = getLogger('Market::useMarkets')

export const useMarkets = (
  context: ConnectedWeb3Context | DisconnectedWeb3Context,
): {
  markets: MarketWithExtraData[]
  status: Status
} => {
  const { marketMakerFactory, conditionalTokens, realitio } = useContracts(context)

  const [status, setStatus] = useState<Status>(Status.Ready)
  const [markets, setMarkets] = useState<MarketWithExtraData[]>([])

  useEffect(() => {
    let isSubscribed = true

    const fetchMarkets = async () => {
      try {
        setStatus(Status.Loading)
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

        const markets = await marketMakerFactory.getMarkets(provider)
        const marketsWithExtraData = await Promise.all(markets.map(getExtraData))

        const validMarkets = marketsWithExtraData.filter(market => market.fee.eq(FEE))

        const marketsOrdered = validMarkets.sort(
          (marketA: MarketWithExtraData, marketB: MarketWithExtraData) => {
            if (marketA.resolution && marketB.resolution) {
              return marketB.resolution.getTime() - marketA.resolution.getTime()
            }
            return 0
          },
        )

        if (isSubscribed) setMarkets(marketsOrdered)

        setStatus(Status.Done)
      } catch (error) {
        logger.error('There was an error fetching the markets data:', error.message)
        setStatus(Status.Error)
      }
    }

    fetchMarkets()
    return () => {
      isSubscribed = false
    }
  }, [context, marketMakerFactory, conditionalTokens, realitio])

  return {
    markets,
    status,
  }
}
