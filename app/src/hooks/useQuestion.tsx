import { useEffect, useState } from 'react'

import { ConnectedWeb3Context } from './connectedWeb3'
import { useContracts } from './useContracts'
import { getLogger } from '../util/logger'
import { Question } from '../util/types'

const logger = getLogger('Market::useQuestion')

export const useQuestion = (
  marketMakerAddress: string,
  context: ConnectedWeb3Context,
): Question => {
  const { conditionalTokens, realitio, buildMarketMaker } = useContracts(context)

  const [question, setQuestion] = useState<string>('')
  const [resolution, setResolution] = useState<Maybe<Date>>(null)
  const [arbitratorAddress, setArbitratorAddress] = useState<string>('')
  const [category, setCategory] = useState<string>('')

  useEffect(() => {
    let isSubscribed = true
    const fetchQuestion = async () => {
      try {
        const marketMaker = buildMarketMaker(marketMakerAddress)

        const conditionId = await marketMaker.getConditionId()
        const questionId = await conditionalTokens.getQuestionId(conditionId)
        const { question, resolution, category, arbitratorAddress } = await realitio.getQuestion(
          questionId,
        )

        if (isSubscribed) {
          setQuestion(question)
          setResolution(resolution)
          setArbitratorAddress(arbitratorAddress)
          setCategory(category)
        }
      } catch (error) {
        logger.error('There was an error fetching the question data:', error.message)
      }
    }

    fetchQuestion()
    return () => {
      isSubscribed = false
    }
  }, [marketMakerAddress, context, conditionalTokens, realitio, buildMarketMaker])

  return { question, resolution, category, arbitratorAddress }
}
