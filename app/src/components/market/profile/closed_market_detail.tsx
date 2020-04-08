import Big from 'big.js'
import { BigNumber, bigNumberify } from 'ethers/utils'
import React, { useEffect, useState } from 'react'
import styled, { withTheme } from 'styled-components'

import { MARKET_FEE } from '../../../common/constants'
import { useContracts } from '../../../hooks'
import { WhenConnected, useConnectedWeb3Context } from '../../../hooks/connectedWeb3'
import { CPKService, ERC20Service } from '../../../services'
import { getLogger } from '../../../util/logger'
import { formatBigNumber, formatDate } from '../../../util/tools'
import { MarketMakerData, OutcomeTableValue, Status } from '../../../util/types'
import { Button, ButtonContainer } from '../../button'
import { ClosedMarket, DisplayArbitrator, SubsectionTitle, TitleValue, ViewCard } from '../../common'
import { FullLoading } from '../../loading'
import { OutcomeTable } from '../outcome_table'

const Grid = styled.div`
  display: grid;
  grid-column-gap: 20px;
  grid-row-gap: 14px;
  grid-template-columns: 1fr;
  margin-bottom: 25px;

  @media (min-width: ${props => props.theme.themeBreakPoints.md}) {
    grid-template-columns: 1fr 1fr 1fr;
  }
`

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
    arbitrator,
    balances,
    collateral: collateralToken,
    isConditionResolved,
    marketMakerFunding: funding,
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

  const fundingFormat = formatBigNumber(funding, collateralToken.decimals)
  const collateralFormat = `${formatBigNumber(collateral, collateralToken.decimals)} ${collateralToken.symbol}`
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

  const disabledColumns = [OutcomeTableValue.CurrentPrice, OutcomeTableValue.Outcome, OutcomeTableValue.Probability]
  if (!account) {
    disabledColumns.push(OutcomeTableValue.Shares)
  }

  const hasWinningOutcomes = earnedCollateral && earnedCollateral.gt(0)

  return (
    <>
      <ClosedMarket date={resolutionFormat} />
      <ViewCard>
        {<SubsectionTitle>Balance</SubsectionTitle>}
        <OutcomeTable
          balances={balances}
          collateral={collateralToken}
          disabledColumns={disabledColumns}
          displayRadioSelection={false}
          probabilities={probabilities}
          withWinningOutcome={true}
        />

        <SubsectionTitle>Details</SubsectionTitle>
        <Grid>
          <TitleValue title="Category" value={question.category} />
          <TitleValue title={'Arbitrator'} value={arbitrator && <DisplayArbitrator arbitrator={arbitrator} />} />
          <TitleValue title="Resolution Date" value={resolutionFormat} />
          <TitleValue title="Fee" value={`${MARKET_FEE}%`} />
          <TitleValue title="Funding" value={fundingFormat} />
        </Grid>
        <SubsectionTitle>Market Results</SubsectionTitle>
        <Grid>
          <TitleValue title="Collateral" value={collateralFormat} />
        </Grid>
        <WhenConnected>
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
