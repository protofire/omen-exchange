import React, { FC, useState, useEffect } from 'react'
import { ethers } from 'ethers'
import { BigNumber } from 'ethers/utils'

import { MarketView } from './market_view'
import { useConnectedWeb3Context } from '../../hooks/connectedWeb3'
import { useContracts } from '../../hooks/useContracts'
import { MarketMakerService } from '../../services'
import { getLogger } from '../../util/logger'
import { Status, BalanceItem, OutcomeSlot, StepProfile, WinnerOutcome } from '../../util/types'
import { useQuestion } from '../../hooks/useQuestion'

const logger = getLogger('Market::MarketView')

interface Props {
  marketMakerAddress: string
}

const MarketViewContainer: FC<Props> = props => {
  const context = useConnectedWeb3Context()
  const { conditionalTokens } = useContracts(context)

  const [balance, setBalance] = useState<BalanceItem[]>([])
  const [marketMakerAddress] = useState<string>(props.marketMakerAddress)
  const [status, setStatus] = useState<Status>(Status.Ready)
  const [funding, setFunding] = useState<BigNumber>(ethers.constants.Zero)

  const [stepProfile, setStepProfile] = useState<StepProfile>(StepProfile.View)
  const [winnerOutcome, setWinnerOutcome] = useState<Maybe<WinnerOutcome>>(null)

  const { question, resolution } = useQuestion(marketMakerAddress, context)

  useEffect(() => {
    const fetchContractData = async ({ enableStatus }: any) => {
      enableStatus && setStatus(Status.Loading)
      try {
        const provider = context.library
        const user = await provider.getSigner().getAddress()

        const marketMaker = new MarketMakerService(marketMakerAddress, conditionalTokens, provider)

        const [
          balanceInformation,
          marketBalanceInformation,
          actualPrice,
          marketFunding,
        ] = await Promise.all([
          marketMaker.getBalanceInformation(user),
          marketMaker.getBalanceInformation(marketMakerAddress),
          // marketMaker.getActualPrice(),
          { actualPriceForYes: 0.5, actualPriceForNo: 0.5 },
          marketMaker.getTotalSupply(),
        ])

        const probabilityForYes = actualPrice.actualPriceForYes * 100
        const probabilityForNo = actualPrice.actualPriceForNo * 100

        const balance = [
          {
            outcomeName: OutcomeSlot.Yes,
            probability: Math.round((probabilityForYes / 100) * 100),
            currentPrice: actualPrice.actualPriceForYes,
            shares: balanceInformation.balanceOfForYes,
            holdings: marketBalanceInformation.balanceOfForYes,
            winningOutcome: winnerOutcome === WinnerOutcome.Yes,
          },
          {
            outcomeName: OutcomeSlot.No,
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
  }, [marketMakerAddress, context, winnerOutcome, conditionalTokens])

  useEffect(() => {
    const fetchContractStatus = async () => {
      try {
        const provider = context.library

        const marketMaker = new MarketMakerService(marketMakerAddress, conditionalTokens, provider)

        const conditionId = await marketMaker.getConditionId()
        const isConditionResolved = await conditionalTokens.isConditionResolved(conditionId)

        if (isConditionResolved) {
          const winnerOutcome = await conditionalTokens.getWinnerOutcome(conditionId)
          setWinnerOutcome(winnerOutcome)
          setStepProfile(StepProfile.CloseMarketDetail)
        }
      } catch (error) {
        logger.error(error && error.message)
      }
    }

    fetchContractStatus()
  }, [marketMakerAddress, context, stepProfile, conditionalTokens])

  return (
    <MarketView
      balance={balance}
      funding={funding}
      marketMakerAddress={marketMakerAddress}
      question={question || ''}
      resolution={resolution}
      status={status}
      stepProfile={stepProfile}
      winnerOutcome={winnerOutcome}
    />
  )
}

export { MarketViewContainer }
