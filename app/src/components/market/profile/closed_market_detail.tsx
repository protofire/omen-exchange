import React, { useEffect, useState } from 'react'
import styled, { withTheme } from 'styled-components'
import { BigNumber } from 'ethers/utils'

import { ViewCard } from '../../common/view_card'
import { Button, OutcomeTable } from '../../common'
import { FullLoading } from '../../common/full_loading'
import { ButtonContainer } from '../../common/button_container'
import { SubsectionTitle } from '../../common/subsection_title'
import { TitleValue } from '../../common/title_value'
import { ClosedMarket } from '../../common/closed_market'
import { Arbitrator, BalanceItem, OutcomeTableValue, Status, Token } from '../../../util/types'
import { ERC20Service } from '../../../services'
import { useConnectedWeb3Context } from '../../../hooks/connectedWeb3'
import { getLogger } from '../../../util/logger'
import { formatBigNumber, formatDate } from '../../../util/tools'
import { useContracts } from '../../../hooks/useContracts'
import { DisplayArbitrator } from '../../common/display_arbitrator'
import { MARKET_FEE } from '../../../common/constants'

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

const ButtonContainerStyled = styled(ButtonContainer)`
  display: grid;
  grid-row-gap: 10px;
  grid-template-columns: 1fr;

  > button {
    margin-left: 0;
  }

  @media (min-width: ${props => props.theme.themeBreakPoints.md}) {
    display: flex;

    > button {
      margin-left: 10px;
    }
  }
`

interface Props {
  theme?: any
  balances: BalanceItem[]
  collateral: Token
  funding: BigNumber
  question: string
  questionId: string
  resolution: Date | null
  marketMakerAddress: string
  isConditionResolved: boolean
  arbitrator: Maybe<Arbitrator>
}

const logger = getLogger('Market::ClosedMarketDetail')

export const ClosedMarketDetailWrapper = (props: Props) => {
  const context = useConnectedWeb3Context()
  const { conditionalTokens, oracle, buildMarketMaker } = useContracts(context)

  const {
    collateral: collateralToken,
    balances,
    marketMakerAddress,
    resolution,
    funding,
    isConditionResolved,
    questionId,
    arbitrator,
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
      await oracle.resolveCondition(questionId, balances.length)

      setStatus(Status.Ready)
    } catch (err) {
      setStatus(Status.Error)
      logger.log(`Error trying to resolve condition: ${err.message}`)
    }
  }

  useEffect(() => {
    let isSubscribed = true

    const fetchBalance = async () => {
      const provider = context.library

      const collateralAddress = await marketMaker.getCollateralToken()
      const collateralService = new ERC20Service(provider, collateralAddress)
      const collateralBalance = await collateralService.getCollateral(marketMakerAddress)
      if (isSubscribed) setCollateral(collateralBalance)
    }

    fetchBalance()

    return () => {
      isSubscribed = false
    }
  }, [collateral, context, marketMakerAddress, marketMaker])

  const redeem = async () => {
    try {
      setStatus(Status.Loading)
      if (!isConditionResolved) {
        setMessage('Resolving condition...')
        // Balances length is the number of outcomes
        await oracle.resolveCondition(questionId, balances.length)
      }

      setMessage('Redeem payout...')
      const collateralAddress = await marketMaker.getCollateralToken()
      const conditionId = await marketMaker.getConditionId()

      await conditionalTokens.redeemPositions(collateralAddress, conditionId, balances.length)

      setStatus(Status.Ready)
    } catch (err) {
      setStatus(Status.Error)
      logger.log(`Error trying to resolve condition or redeem: ${err.message}`)
    }
  }

  const fundingFormat = formatBigNumber(funding, collateralToken.decimals)
  const collateralFormat = `${formatBigNumber(collateral, collateralToken.decimals)} ${
    collateralToken.symbol
  }`
  const resolutionFormat = resolution ? formatDate(resolution) : ''
  const winningOutcome = balances.find((balanceItem: BalanceItem) => balanceItem.winningOutcome)

  return (
    <>
      <ClosedMarket date={resolutionFormat} />
      <ViewCard>
        {<SubsectionTitle>Balance</SubsectionTitle>}
        <OutcomeTable
          balances={balances}
          collateral={collateralToken}
          disabledColumns={[OutcomeTableValue.CurrentPrice, OutcomeTableValue.PriceAfterTrade]}
          withWinningOutcome={true}
          displayRadioSelection={false}
        />

        <SubsectionTitle>Details</SubsectionTitle>
        <Grid>
          <TitleValue title="Category" value="Politics" />
          <TitleValue
            title={'Arbitrator'}
            value={arbitrator && <DisplayArbitrator arbitrator={arbitrator} />}
          />
          <TitleValue title="Resolution Date" value={resolutionFormat} />
          <TitleValue title="Fee" value={`${MARKET_FEE}%`} />
          <TitleValue title="Funding" value={fundingFormat} />
        </Grid>
        <SubsectionTitle>Market Results</SubsectionTitle>
        <Grid>
          <TitleValue title="Collateral" value={collateralFormat} />
        </Grid>

        <ButtonContainerStyled>
          {winningOutcome && !winningOutcome.shares.isZero() && (
            <Button onClick={() => redeem()}>Redeem</Button>
          )}
          {!isConditionResolved && winningOutcome && winningOutcome.shares.isZero() ? (
            <Button onClick={resolveCondition}>Resolve Condition</Button>
          ) : null}
        </ButtonContainerStyled>
      </ViewCard>
      {status === Status.Loading ? <FullLoading message={message} /> : null}
    </>
  )
}

export const ClosedMarketDetail = withTheme(ClosedMarketDetailWrapper)
