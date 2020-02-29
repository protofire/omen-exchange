import { useEffect, useState } from 'react'

import { getLogger } from '../util/logger'
import { Question } from '../util/types'

import { ConnectedWeb3Context } from './connectedWeb3'
import { useContracts } from './useContracts'

const logger = getLogger('Market::useQuestion')

export const useQuestion = (marketMakerAddress: string, context: ConnectedWeb3Context): Question => {
  const { buildMarketMaker, conditionalTokens, realitio } = useContracts(context)

  const [questionId, setQuestionId] = useState<string>('')
  const [question, setQuestion] = useState<string>('')
  const [resolution, setResolution] = useState<Maybe<Date>>(null)
  const [arbitratorAddress, setArbitratorAddress] = useState<string>('')
  const [category, setCategory] = useState<string>('')
  const [outcomes, setOutcomes] = useState<string[]>([])

  useEffect(() => {
    let isSubscribed = true
    const fetchQuestion = async () => {
      try {
        const marketMaker = buildMarketMaker(marketMakerAddress)

        const conditionId = await marketMaker.getConditionId()
        const questionId = await conditionalTokens.getQuestionId(conditionId)
        const { arbitratorAddress, category, outcomes, question, resolution } = await realitio.getQuestion(questionId)

        if (isSubscribed) {
          setQuestionId(questionId)
          setQuestion(question)
          setResolution(resolution)
          setArbitratorAddress(arbitratorAddress)
          setCategory(category)
          setOutcomes(outcomes)
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

  return { questionId, question, resolution, category, arbitratorAddress, outcomes }
}
