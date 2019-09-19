import { ethers } from 'ethers'
import React, { FC, useState } from 'react'
import { useWeb3Context } from 'web3-react'
import moment from 'moment'

import { MarketWizardCreator, MarketData } from './market_wizard_creator'
import {
  RealitioService,
  ERC20Service,
  ConditionalTokenService,
  MarketMakerService,
} from '../../services'
import { getContractAddress } from '../../util/addresses'

export enum Status {
  Ready = 'Ready',
  PostingQuestion = 'Posting question to realitio',
  PrepareCondition = 'Prepare condition',
  ApprovingDAI = 'Approving DAI',
  CreateMarketMaker = 'Create market maker',
  ApproveDAIForMarketMaker = 'Approve dai for market maker',
  InitialTradeInMarketMaker = 'initial trade in market maker',
  Done = 'Done',
}

const MarketWizardCreatorContainer: FC = () => {
  const context = useWeb3Context()
  const [status, setStatus] = useState<Status>(Status.Ready)
  const [questionId, setQuestionId] = useState<string | null>(null)
  const [marketMakerAddress, setMarketMakerAddress] = useState<string | null>(null)

  const handleSubmit = async (data: MarketData) => {
    if (!context.networkId || !context.library) {
      throw new Error('Network is not available')
    }
    if (!data.resolution) {
      throw new Error('resolution time was not specified')
    }

    const networkId = context.networkId
    const provider = context.library
    const user = await provider.getSigner().getAddress()

    const { question, resolution, funding } = data
    const openingDateMoment = moment(resolution)

    setStatus(Status.PostingQuestion)
    const questionId = await RealitioService.askQuestion(
      question,
      openingDateMoment,
      provider,
      networkId,
    )
    setQuestionId(questionId)

    setStatus(Status.PrepareCondition)
    const conditionId = await ConditionalTokenService.prepareCondition(
      questionId,
      provider,
      networkId,
    )

    // approve movement of DAI to MarketMakerFactory
    setStatus(Status.ApprovingDAI)
    const fundingWei = ethers.utils.bigNumberify(funding).mul(ethers.constants.WeiPerEther)
    const daiAddress = getContractAddress(networkId, 'dai')
    const marketMakerFactoryAddress = getContractAddress(networkId, 'marketMakerFactory')
    const daiService = new ERC20Service(daiAddress)

    const hasEnoughAlowance = await daiService.hasEnoughAllowance(
      provider,
      user,
      marketMakerFactoryAddress,
      fundingWei,
    )
    if (!hasEnoughAlowance) {
      await daiService.approve(provider, marketMakerFactoryAddress, fundingWei)
    }

    setStatus(Status.CreateMarketMaker)
    const marketMakerAddress = await MarketMakerService.createMarketMaker(
      conditionId,
      fundingWei,
      provider,
      networkId,
    )
    setMarketMakerAddress(marketMakerAddress)

    setStatus(Status.ApproveDAIForMarketMaker)
    await daiService.approveUnlimited(provider, marketMakerAddress)

    setStatus(Status.InitialTradeInMarketMaker)
    const marketMakerService = new MarketMakerService(marketMakerAddress)
    await marketMakerService.trade(provider, ['1000000000', '0'])

    setStatus(Status.Done)
  }

  return (
    <MarketWizardCreator
      callback={handleSubmit}
      status={status}
      questionId={questionId}
      marketMakerAddress={marketMakerAddress}
    />
  )
}

export { MarketWizardCreatorContainer }
