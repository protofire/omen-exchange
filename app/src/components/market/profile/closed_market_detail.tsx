import { BigNumber } from 'ethers/utils'
import React, { useEffect, useState } from 'react'
import { withTheme } from 'styled-components'

import { useContracts } from '../../../hooks'
import { WhenConnected, useConnectedWeb3Context } from '../../../hooks/connectedWeb3'
import { CPKService, ERC20Service } from '../../../services'
import { getLogger } from '../../../util/logger'
import { formatDate } from '../../../util/tools'
import { Arbitrator, BalanceItem, OutcomeTableValue, Status, Token } from '../../../util/types'
import { Button, ButtonContainer } from '../../button'
import { ClosedMarket, SubsectionTitle, SubsectionTitleWrapper, ViewCard } from '../../common'
import { FullLoading } from '../../loading'
import { ClosedMarketTopDetails } from '../closed_market_top_details'
import { OutcomeTable } from '../outcome_table'

interface Props {
  theme?: any
  balances: BalanceItem[]
  collateral: Token
  category: string
  funding: BigNumber
  question: string
  questionId: string
  questionRaw: string
  questionTemplateId: BigNumber
  resolution: Date | null
  marketMakerAddress: string
  isConditionResolved: boolean
  arbitrator: Maybe<Arbitrator>
}

const logger = getLogger('Market::ClosedMarketDetail')

export const ClosedMarketDetailWrapper = (props: Props) => {
  const context = useConnectedWeb3Context()
  const { account, library: provider } = context
  const { buildMarketMaker, conditionalTokens, oracle } = useContracts(context)

  const {
    balances,
    collateral: collateralToken,
    isConditionResolved,
    marketMakerAddress,
    questionId,
    questionRaw,
    questionTemplateId,
    resolution,
  } = props

  const [status, setStatus] = useState<Status>(Status.Ready)
  const [message, setMessage] = useState('')
  const [collateral, setCollateral] = useState<BigNumber>(new BigNumber(0))

  const marketMaker = buildMarketMaker(marketMakerAddress)

  const resolveCondition = async () => {
    try {
      setStatus(Status.Loading)
      setMessage('Resolve condition...')

      // Balances length is the number of outcomes
      await oracle.resolveCondition(questionId, questionTemplateId, questionRaw, balances.length)

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

  const resolutionFormat = resolution ? formatDate(resolution) : ''
  const winningOutcome = balances.find((balanceItem: BalanceItem) => balanceItem.winningOutcome)

  const redeem = async () => {
    try {
      setStatus(Status.Loading)
      setMessage('Redeem payout...')

      const cpk = await CPKService.create(provider)

      await cpk.redeemPositions({
        isConditionResolved,
        questionId,
        questionRaw,
        questionTemplateId,
        numOutcomes: balances.length,
        winningOutcome,
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

  const disabledColumns = [OutcomeTableValue.CurrentPrice]
  if (!account) {
    disabledColumns.push(OutcomeTableValue.Shares)
  }

  return (
    <>
      <ClosedMarket date={resolutionFormat} />
      <ViewCard>
        <ClosedMarketTopDetails marketMakerAddress={marketMakerAddress} />

        <SubsectionTitleWrapper>
          <SubsectionTitle>Balance</SubsectionTitle>
        </SubsectionTitleWrapper>

        <OutcomeTable
          balances={balances}
          collateral={collateralToken}
          disabledColumns={disabledColumns}
          displayRadioSelection={false}
          probabilities={probabilities}
          withWinningOutcome={true}
        />

        <WhenConnected>
          <ButtonContainer>
            {winningOutcome && !winningOutcome.shares.isZero() && <Button onClick={() => redeem()}>Redeem</Button>}
            {!isConditionResolved && winningOutcome && winningOutcome.shares.isZero() && (
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
