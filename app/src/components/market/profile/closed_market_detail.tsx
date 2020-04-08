import Big from 'big.js'
import { BigNumber, bigNumberify } from 'ethers/utils'
import React, { useEffect, useState } from 'react'
import { withTheme } from 'styled-components'

import { useContracts } from '../../../hooks'
import { WhenConnected, useConnectedWeb3Context } from '../../../hooks/connectedWeb3'
import { CPKService, ERC20Service } from '../../../services'
import { getLogger } from '../../../util/logger'
import { formatDate } from '../../../util/tools'
import { MarketMakerData, OutcomeTableValue, Status } from '../../../util/types'
import { Button, ButtonContainer } from '../../button'
import { ClosedMarket, SubsectionTitle, SubsectionTitleWrapper, ViewCard } from '../../common'
import { FullLoading } from '../../loading'
import { ClosedMarketTopDetails } from '../closed_market_top_details'
import { OutcomeTable } from '../outcome_table'

import MarketResolutionMessage from './market_resolution_message'

interface Props {
  theme?: any
  marketMakerData: MarketMakerData
}

const logger = getLogger('Market::ClosedMarketDetail')

const computeEarnedCollateral = (payouts: Maybe<number[]>, balances: BigNumber[]): Maybe<BigNumber> => {
  if (!payouts) {
    return null
  }

  const earnedCollateralPerOutcome = balances.map((balance, index) => new Big(balance.toString()).mul(payouts[index]))

  const earnedCollateral = earnedCollateralPerOutcome.reduce((a, b) => a.add(b))

  return bigNumberify(earnedCollateral.toString())
}

export const ClosedMarketDetailWrapper = (props: Props) => {
  const context = useConnectedWeb3Context()
  const { account, library: provider } = context
  const { buildMarketMaker, conditionalTokens, oracle } = useContracts(context)

  const { marketMakerData } = props

  const {
    address: marketMakerAddress,
    balances,
    collateral: collateralToken,
    isConditionResolved,
    payouts,
    question,
  } = marketMakerData

  const [status, setStatus] = useState<Status>(Status.Ready)
  const [message, setMessage] = useState('')
  const [collateral, setCollateral] = useState<BigNumber>(new BigNumber(0))

  const marketMaker = buildMarketMaker(marketMakerAddress)

  const resolveCondition = async () => {
    try {
      setStatus(Status.Loading)
      setMessage('Resolve condition...')

      // Balances length is the number of outcomes
      await oracle.resolveCondition(question, balances.length)

      setStatus(Status.Ready)
    } catch (err) {
      setStatus(Status.Error)
      logger.log(`Error trying to resolve condition: ${err.message}`)
    }
  }

  useEffect(() => {
    let isSubscribed = true

    const fetchBalance = async () => {
      const collateralAddress = await marketMaker.getCollateralToken()
      const collateralService = new ERC20Service(provider, account, collateralAddress)
      const collateralBalance = await collateralService.getCollateral(marketMakerAddress)
      if (isSubscribed) setCollateral(collateralBalance)
    }

    fetchBalance()

    return () => {
      isSubscribed = false
    }
  }, [collateral, provider, account, marketMakerAddress, marketMaker])

  const resolutionFormat = question.resolution ? formatDate(question.resolution) : ''

  const earnedCollateral = computeEarnedCollateral(
    payouts,
    balances.map(balance => balance.shares),
  )

  const redeem = async () => {
    try {
      if (!earnedCollateral) {
        return
      }
      setStatus(Status.Loading)
      setMessage('Redeem payout...')

      const cpk = await CPKService.create(provider)

      await cpk.redeemPositions({
        isConditionResolved,
        earnedCollateral,
        question,
        numOutcomes: balances.length,
        oracle,
        collateralToken,
        marketMaker,
        conditionalTokens,
      })

      setStatus(Status.Ready)
    } catch (err) {
      setStatus(Status.Error)
      logger.log(`Error trying to resolve condition or redeem: ${err.message}`)
    }
  }

  const probabilities = balances.map(balance => balance.probability)

  const disabledColumns = [
    OutcomeTableValue.CurrentPrice,
    OutcomeTableValue.OutcomeProbability,
    OutcomeTableValue.Probability,
  ]
  if (!account) {
    disabledColumns.push(OutcomeTableValue.Shares)
  }

  const hasWinningOutcomes = earnedCollateral && earnedCollateral.gt(0)
  const winnersOutcomes = payouts ? payouts.filter(payout => payout > 0).length : 0
  const userWinnersOutcomes = payouts
    ? payouts.filter((payout, index) => balances[index].shares.gt(0) && payout > 0).length
    : 0
  const userWinnerShares = payouts
    ? balances.reduce((acc, balance, index) => (payouts[index] > 0 ? acc.add(balance.shares) : acc), new BigNumber(0))
    : new BigNumber(0)
  const EPS = 0.01
  const allPayoutsEqual = payouts ? payouts.every(payout => Math.abs(payout - 1 / payouts.length) <= EPS) : false

  return (
    <>
      <ClosedMarket date={resolutionFormat} />
      <ViewCard>
        <ClosedMarketTopDetails collateral={collateral} marketMakerData={marketMakerData} />

        <SubsectionTitleWrapper>
          <SubsectionTitle>Balance</SubsectionTitle>
        </SubsectionTitleWrapper>

        <OutcomeTable
          balances={balances}
          collateral={collateralToken}
          disabledColumns={disabledColumns}
          displayRadioSelection={false}
          payouts={payouts}
          probabilities={probabilities}
          withWinningOutcome={true}
        />

        <WhenConnected>
          {hasWinningOutcomes && (
            <MarketResolutionMessage
              collateralToken={collateralToken}
              earnedCollateral={earnedCollateral}
              invalid={allPayoutsEqual}
              userWinnerShares={userWinnerShares}
              userWinnersOutcomes={userWinnersOutcomes}
              winnersOutcomes={winnersOutcomes}
            ></MarketResolutionMessage>
          )}
          <ButtonContainer>
            {isConditionResolved && hasWinningOutcomes && <Button onClick={() => redeem()}>Redeem</Button>}
            {!isConditionResolved && hasWinningOutcomes && (
              <Button onClick={resolveCondition}>Resolve Condition</Button>
            )}
          </ButtonContainer>
        </WhenConnected>
      </ViewCard>
      {status === Status.Loading && <FullLoading message={message} />}
    </>
  )
}

export const ClosedMarketDetail = withTheme(ClosedMarketDetailWrapper)
