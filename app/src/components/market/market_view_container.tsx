import React, { FC, useState, useEffect } from 'react'
import { ethers } from 'ethers'
import { BigNumber } from 'ethers/utils'

import { MarketView } from './market_view'
import { useConnectedWeb3Context } from '../../hooks/connectedWeb3'
import { useContracts } from '../../hooks/useContracts'
import { MarketMakerService } from '../../services'
import { getLogger } from '../../util/logger'
import { Status, BalanceItem, OutcomeSlots, StepProfile, WinnerOutcome } from '../../util/types'

const logger = getLogger('Market::MarketView')

interface Props {
  address: string
}

const MarketViewContainer: FC<Props> = props => {
  const context = useConnectedWeb3Context()
  const { conditionalTokens, realitio } = useContracts()

  const [balance, setBalance] = useState<BalanceItem[]>([])
  const [address] = useState<string>(props.address)
  const [status, setStatus] = useState<Status>(Status.Ready)
  const [funding, setFunding] = useState<BigNumber>(ethers.constants.Zero)
  const [question, setQuestion] = useState<string | null>(null)
  const [resolution, setResolution] = useState<Maybe<Date>>(null)
  const [stepProfile, setStepProfile] = useState<StepProfile>(StepProfile.View)
  const [winnerOutcome, setWinnerOutcome] = useState<Maybe<WinnerOutcome>>(null)

  useEffect(() => {
    const fetchContractData = async ({ enableStatus }: any) => {
      enableStatus && setStatus(Status.Loading)
      try {
        const provider = context.library
        const user = await provider.getSigner().getAddress()

        const marketMaker = new MarketMakerService(address, conditionalTokens, provider)

        const [
          balanceInformation,
          marketBalanceInformation,
          actualPrice,
          marketFunding,
        ] = await Promise.all([
          marketMaker.getBalanceInformation(user),
          marketMaker.getBalanceInformation(address),
          marketMaker.getActualPrice(),
          marketMaker.getFunding(),
        ])

        const probabilityForYes = actualPrice.actualPriceForYes * 100
        const probabilityForNo = actualPrice.actualPriceForNo * 100

        const balance = [
          {
            outcomeName: OutcomeSlots.Yes,
            probability: Math.round((probabilityForYes / 100) * 100),
            currentPrice: actualPrice.actualPriceForYes,
            shares: balanceInformation.balanceOfForYes,
            holdings: marketBalanceInformation.balanceOfForYes,
            winningOutcome: winnerOutcome === WinnerOutcome.Yes,
          },
          {
            outcomeName: OutcomeSlots.No,
            probability: Math.round((probabilityForNo / 100) * 100),
            currentPrice: actualPrice.actualPriceForNo,
            shares: balanceInformation.balanceOfForNo,
            holdings: marketBalanceInformation.balanceOfForNo,
            winningOutcome: winnerOutcome === WinnerOutcome.No,
          },
        ]

        setBalance(balance)
        setFunding(marketFunding)

        enableStatus && setStatus(Status.Done)
      } catch (error) {
        logger.error(error && error.message)
        enableStatus && setStatus(Status.Error)
      }
    }

    fetchContractData({ enableStatus: true })

    const intervalId = setInterval(() => {
      fetchContractData({ enableStatus: false })
    }, 2000)

    return () => clearInterval(intervalId)
    // eslint-disable-next-line
  }, [address, context, winnerOutcome])

  // fetch Realitio question data
  useEffect(() => {
    const fetchQuestion = async () => {
      try {
        const provider = context.library

        const marketMaker = new MarketMakerService(address, conditionalTokens, provider)

        const conditionId = await marketMaker.getConditionId()
        const questionId = await conditionalTokens.getQuestionId(conditionId, provider)
        const { question, resolution } = await realitio.getQuestion(questionId, provider)

        setQuestion(question)
        setResolution(resolution)
      } catch (error) {
        logger.error('There was an error fetching the question data:', error.message)
      }
    }

    fetchQuestion()
  }, [address, context, conditionalTokens, realitio])

  useEffect(() => {
    const fetchContractStatus = async () => {
      try {
        const provider = context.library
        const userAddress = await provider.getSigner().getAddress()

        const marketMaker = new MarketMakerService(address, conditionalTokens, provider)

        const conditionId = await marketMaker.getConditionId()
        const isConditionResolved = await conditionalTokens.isConditionResolved(conditionId)

        const ownerAddress = await marketMaker.getOwner()
        const isMarketOwner = ownerAddress.toLowerCase() === userAddress.toLowerCase()

        if (isConditionResolved) {
          const winnerOutcome = await conditionalTokens.getWinnerOutcome(conditionId)
          setWinnerOutcome(winnerOutcome)
          if (isMarketOwner) {
            setStepProfile(StepProfile.Withdraw)
          } else {
            setStepProfile(StepProfile.Redeem)
          }
        }
      } catch (error) {
        logger.error(error && error.message)
      }
    }

    fetchContractStatus()
  }, [address, context, stepProfile, conditionalTokens])

  return (
    <MarketView
      balance={balance}
      funding={funding}
      marketAddress={address}
      question={question || ''}
      resolution={resolution}
      status={status}
      stepProfile={stepProfile}
      winnerOutcome={winnerOutcome}
    />
  )
}

export { MarketViewContainer }
