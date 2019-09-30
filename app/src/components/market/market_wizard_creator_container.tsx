import { ethers } from 'ethers'
import React, { FC, useState } from 'react'
import moment from 'moment'

import { getLogger } from '../../util/logger'
import { computeInitialTradeOutcomeTokens } from '../../util/tools'
import { StatusMarketCreation } from '../../util/types'
import { MarketWizardCreator, MarketData } from './market_wizard_creator'
import {
  RealitioService,
  ERC20Service,
  ConditionalTokenService,
  MarketMakerService,
} from '../../services'
import { getContractAddress } from '../../util/addresses'
import { useConnectedWeb3Context } from '../../hooks/connectedWeb3'

const logger = getLogger('Market::MarketWizardCreatorContainer')

const MarketWizardCreatorContainer: FC = () => {
  const context = useConnectedWeb3Context()
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
      const questionId = await RealitioService.askQuestion(
        question,
        openingDateMoment,
        provider,
        networkId,
      )
      setQuestionId(questionId)

      setStatus(StatusMarketCreation.PrepareCondition)
      const conditionId = await ConditionalTokenService.prepareCondition(
        questionId,
        provider,
        networkId,
      )

      // approve movement of DAI to MarketMakerFactory
      setStatus(StatusMarketCreation.ApprovingDAI)

      const fundingInWei = funding.mul(ethers.utils.bigNumberify(ethers.constants.WeiPerEther))

      const daiAddress = getContractAddress(networkId, 'dai')
      const marketMakerFactoryAddress = getContractAddress(networkId, 'marketMakerFactory')
      const daiService = new ERC20Service(daiAddress)

      const hasEnoughAlowance = await daiService.hasEnoughAllowance(
        provider,
        user,
        marketMakerFactoryAddress,
        fundingInWei,
      )
      if (!hasEnoughAlowance) {
        await daiService.approve(provider, marketMakerFactoryAddress, fundingInWei)
      }

      setStatus(StatusMarketCreation.CreateMarketMaker)
      const marketMakerAddress = await MarketMakerService.createMarketMaker(
        conditionId,
        fundingInWei,
        provider,
        networkId,
      )
      setMarketMakerAddress(marketMakerAddress)

      setStatus(StatusMarketCreation.ApproveDAIForMarketMaker)
      await daiService.approveUnlimited(provider, marketMakerAddress)

      setStatus(StatusMarketCreation.InitialTradeInMarketMaker)
      const marketMakerService = new MarketMakerService(marketMakerAddress)
      const initialTradeOutcomeTokens = computeInitialTradeOutcomeTokens(
        [+outcomeProbabilityOne, +outcomeProbabilityTwo],
        fundingInWei,
      )
      await marketMakerService.trade(provider, initialTradeOutcomeTokens)

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
        status={status}
        questionId={questionId}
        marketMakerAddress={marketMakerAddress}
      />
    </>
  )
}

export { MarketWizardCreatorContainer }
