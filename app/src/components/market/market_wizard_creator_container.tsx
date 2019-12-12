import React, { FC, useState } from 'react'
import moment from 'moment'

import { getLogger } from '../../util/logger'
import { StatusMarketCreation } from '../../util/types'
import { MarketWizardCreator, MarketData } from './market_wizard_creator'
import { ERC20Service } from '../../services'
import { getArbitrator, getContractAddress } from '../../util/addresses'
import { useConnectedWeb3Context } from '../../hooks/connectedWeb3'
import { useContracts } from '../../hooks/useContracts'

const logger = getLogger('Market::MarketWizardCreatorContainer')

const MarketWizardCreatorContainer: FC = () => {
  const context = useConnectedWeb3Context()
  const { conditionalTokens, marketMakerFactory, realitio, buildMarketMaker } = useContracts(
    context,
  )

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

      const { collateral, arbitratorId, question, resolution, funding, outcomes, category } = data
      const openingDateMoment = moment(resolution)

      const arbitrator = getArbitrator(networkId, arbitratorId)

      setStatus(StatusMarketCreation.PostingQuestion)
      const questionId = await realitio.askQuestion(
        question,
        outcomes,
        category,
        arbitrator.address,
        openingDateMoment,
      )
      setQuestionId(questionId)

      setStatus(StatusMarketCreation.PrepareCondition)

      const oracleAddress = getContractAddress(networkId, 'oracle')
      const conditionId = await conditionalTokens.prepareCondition(questionId, oracleAddress)

      // approve movement of collateral token to MarketMakerFactory
      setStatus(StatusMarketCreation.ApprovingCollateral)

      const marketMakerFactoryAddress = getContractAddress(networkId, 'marketMakerFactory')
      const collateralService = new ERC20Service(provider, collateral.address)

      const hasEnoughAlowance = await collateralService.hasEnoughAllowance(
        user,
        marketMakerFactoryAddress,
        funding,
      )
      if (!hasEnoughAlowance) {
        await collateralService.approve(marketMakerFactoryAddress, funding)
      }

      setStatus(StatusMarketCreation.CreateMarketMaker)
      const marketMakerAddress = await marketMakerFactory.createMarketMaker(
        conditionalTokens.address,
        collateral.address,
        conditionId,
      )
      setMarketMakerAddress(marketMakerAddress)

      setStatus(StatusMarketCreation.ApproveCollateralForMarketMaker)
      await collateralService.approveUnlimited(marketMakerAddress)

      setStatus(StatusMarketCreation.AddFunding)
      const marketMakerService = buildMarketMaker(marketMakerAddress)
      // TODO: pass all outcomes
      await marketMakerService.addInitialFunding(
        funding,
        +outcomes[0].probability,
        +outcomes[1].probability,
      )

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
