import React, { FC, useState } from 'react'
import moment from 'moment'

import { getLogger } from '../../util/logger'
import { computeInitialTradeOutcomeTokens } from '../../util/tools'
import { StatusMarketCreation } from '../../util/types'
import { MarketWizardCreator, MarketData } from './market_wizard_creator'
import { ERC20Service, MarketMakerService } from '../../services'
import { getContractAddress } from '../../util/addresses'
import { useConnectedWeb3Context } from '../../hooks/connectedWeb3'
import { useContracts } from '../../hooks/useContracts'

const logger = getLogger('Market::MarketWizardCreatorContainer')

const MarketWizardCreatorContainer: FC = () => {
  const context = useConnectedWeb3Context()
  const { conditionalTokens, marketMakerFactory, realitio } = useContracts(context)

  const [status, setStatus] = useState<StatusMarketCreation>(StatusMarketCreation.Ready)
  const [questionId, setQuestionId] = useState<string | null>(null)
  const [marketMakerAddress, setMarketMakerAddress] = useState<string | null>(null)

  const handleSubmit = async (data: MarketData) => {
    try {
      if (!data.resolution) {
        throw new Error('resolution time was not specified')
      }

      const networkId = context.networkId
      const provider = context.library
      const user = await provider.getSigner().getAddress()

      const { question, resolution, funding, outcomeProbabilityOne, outcomeProbabilityTwo } = data
      const openingDateMoment = moment(resolution)

      setStatus(StatusMarketCreation.PostingQuestion)
      const questionId = await realitio.askQuestion(question, openingDateMoment)
      setQuestionId(questionId)

      setStatus(StatusMarketCreation.PrepareCondition)

      const oracleAddress: string =
        process.env.NODE_ENV === 'development'
          ? user
          : getContractAddress(networkId, 'realitioArbitrator')
      const conditionId = await conditionalTokens.prepareCondition(questionId, oracleAddress)

      // approve movement of DAI to MarketMakerFactory
      setStatus(StatusMarketCreation.ApprovingDAI)

      const daiAddress = getContractAddress(networkId, 'dai')
      const marketMakerFactoryAddress = getContractAddress(networkId, 'marketMakerFactory')
      const daiService = new ERC20Service(daiAddress)

      const hasEnoughAlowance = await daiService.hasEnoughAllowance(
        provider,
        user,
        marketMakerFactoryAddress,
        funding,
      )
      if (!hasEnoughAlowance) {
        await daiService.approve(provider, marketMakerFactoryAddress, funding)
      }

      setStatus(StatusMarketCreation.CreateMarketMaker)
      const marketMakerAddress = await marketMakerFactory.createMarketMaker(
        conditionalTokens.address,
        daiAddress,
        conditionId,
        funding,
      )
      setMarketMakerAddress(marketMakerAddress)

      // Don't perform initial trade if odds are 50/50
      if (+outcomeProbabilityOne !== 50) {
        setStatus(StatusMarketCreation.ApproveDAIForMarketMaker)
        await daiService.approveUnlimited(provider, marketMakerAddress)

        setStatus(StatusMarketCreation.InitialTradeInMarketMaker)
        const marketMaker = new MarketMakerService(marketMakerAddress, conditionalTokens, provider)
        const initialTradeOutcomeTokens = computeInitialTradeOutcomeTokens(
          [+outcomeProbabilityOne, +outcomeProbabilityTwo],
          funding,
        )
        await marketMaker.trade(initialTradeOutcomeTokens)
      }

      setStatus(StatusMarketCreation.Done)
    } catch (err) {
      setStatus(StatusMarketCreation.Error)
      logger.error(err.message)
    }
  }

  return (
    <>
      <MarketWizardCreator
        callback={handleSubmit}
        marketMakerAddress={marketMakerAddress}
        questionId={questionId}
        status={status}
      />
    </>
  )
}

export { MarketWizardCreatorContainer }
