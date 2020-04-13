import Big from 'big.js'
import { BigNumber, bigNumberify } from 'ethers/utils'
import React, { useEffect, useState } from 'react'
import styled from 'styled-components'

import { useContracts } from '../../../../../hooks'
import { WhenConnected, useConnectedWeb3Context } from '../../../../../hooks/connectedWeb3'
import { CPKService, ERC20Service } from '../../../../../services'
import { getLogger } from '../../../../../util/logger'
import { MarketMakerData, OutcomeTableValue, Status } from '../../../../../util/types'
import { Button } from '../../../../button'
import { ButtonType } from '../../../../button/button_styling_types'
import { FullLoading } from '../../../../loading'
import { ClosedMarketTopDetails } from '../../../common/closed_market_top_details'
import { ButtonContainerFullWidth } from '../../../common/common_styled'
import MarketResolutionMessage from '../../../common/market_resolution_message'
import { OutcomeTable } from '../../../common/outcome_table'
import { ViewCard } from '../../../common/view_card'

const MarketResolutionMessageStyled = styled(MarketResolutionMessage)`
  margin-top: 20px;
`

interface Props {
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

export const ClosedMarketDetail = (props: Props) => {
  const context = useConnectedWeb3Context()
  const { account, library: provider } = context
  const { buildMarketMaker, conditionalTokens, oracle } = useContracts(context)

  const { marketMakerData } = props

  const {
    address: marketMakerAddress,
    arbitrator,
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
      <ViewCard>
        <ClosedMarketTopDetails collateral={collateral} marketMakerData={marketMakerData} />
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
            <MarketResolutionMessageStyled
              arbitrator={arbitrator}
              collateralToken={collateralToken}
              earnedCollateral={earnedCollateral}
              invalid={allPayoutsEqual}
              userWinnerShares={userWinnerShares}
              userWinnersOutcomes={userWinnersOutcomes}
              winnersOutcomes={winnersOutcomes}
            ></MarketResolutionMessageStyled>
          )}
          {isConditionResolved ||
            (hasWinningOutcomes && (
              <>
                <ButtonContainerFullWidth borderTop={true}>
                  {!isConditionResolved && hasWinningOutcomes && (
                    <Button buttonType={ButtonType.primary} onClick={resolveCondition}>
                      Resolve Condition
                    </Button>
                  )}
                  {isConditionResolved && hasWinningOutcomes && (
                    <Button buttonType={ButtonType.primary} onClick={() => redeem()}>
                      Redeem
                    </Button>
                  )}
                </ButtonContainerFullWidth>
              </>
            ))}
        </WhenConnected>
      </ViewCard>
      {status === Status.Loading && <FullLoading message={message} />}
    </>
  )
}
