import React, { useState } from 'react'
import styled, { withTheme } from 'styled-components'
import { BigNumber } from 'ethers/utils'

import { SectionTitle } from '../common/section_title'
import { divBN, formatBigNumber, formatDate } from '../../util/tools'
import { ViewCard } from '../common/view_card/'
import { Table, TD, TR } from '../common/table'
import { BalanceItem, OutcomeTableValue, Status, Token } from '../../util/types'
import { OutcomeTable } from '../common/outcome_table'
import { FullLoading } from '../common/full_loading'
import { SubsectionTitle } from '../common/subsection_title'
import { BigNumberInput, BigNumberInputReturn } from '../common/big_number_input'
import { FormRow } from '../common/form_row'
import { TextfieldCustomPlaceholder } from '../common/textfield_custom_placeholder'
import { ButtonContainer } from '../common/button_container'
import { Button } from '../common/button'
import { getLogger } from '../../util/logger'
import { ERC20Service, MarketMakerService } from '../../services'
import { useContracts } from '../../hooks/useContracts'
import { useConnectedWeb3Context } from '../../hooks/connectedWeb3'
import { ButtonLink } from '../common/button_link'
import { RouteComponentProps, withRouter } from 'react-router-dom'
import { BalanceToken } from '../common/balance_token'

interface Props extends RouteComponentProps<any> {
  marketMakerAddress: string
  question: string
  resolution: Maybe<Date>
  totalPoolShares: BigNumber
  userPoolShares: BigNumber
  marketMakerFunding: BigNumber
  marketMakerUserFunding: BigNumber
  balance: BalanceItem[]
  theme?: any
  collateral: Token
}

const TableStyled = styled(Table)`
  margin-bottom: 30px;
`

const AmountWrapper = styled(FormRow)`
  margin-bottom: 30px;
  width: 100%;

  @media (min-width: ${props => props.theme.themeBreakPoints.md}) {
    width: 50%;
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

const ButtonLinkStyled = styled(ButtonLink)`
  margin-right: auto;
`

const logger = getLogger('Market::Fund')

const MarketFundWrapper: React.FC<Props> = (props: Props) => {
  const {
    question,
    resolution,
    totalPoolShares,
    userPoolShares,
    balance,
    marketMakerUserFunding,
    marketMakerFunding,
    theme,
    marketMakerAddress,
    collateral,
  } = props

  const context = useConnectedWeb3Context()
  const { conditionalTokens, realitio } = useContracts(context)

  const [amount, setAmount] = useState<BigNumber>(new BigNumber(0))
  const [status, setStatus] = useState<Status>(Status.Ready)
  const [message, setMessage] = useState<string>('')

  const marketMakerFundingPercentage: Maybe<number> = marketMakerFunding.isZero()
    ? null
    : 100 * divBN(marketMakerUserFunding, marketMakerFunding)
  const userPoolSharesPercentage: Maybe<number> = totalPoolShares.isZero()
    ? null
    : 100 * divBN(userPoolShares, totalPoolShares)

  const addFunding = async () => {
    try {
      setStatus(Status.Loading)
      setMessage(
        `Add funding amount: ${formatBigNumber(amount, collateral.decimals)} ${
          collateral.symbol
        } ...`,
      )

      const provider = context.library
      const user = await provider.getSigner().getAddress()
      const marketMaker = new MarketMakerService(
        marketMakerAddress,
        conditionalTokens,
        realitio,
        provider,
        user,
      )

      const collateralAddress = await marketMaker.getCollateralToken()
      const collateralService = new ERC20Service(provider, collateralAddress)

      await collateralService.approve(marketMakerAddress, amount)

      await marketMaker.addFunding(amount)

      setStatus(Status.Ready)
    } catch (err) {
      setStatus(Status.Error)
      logger.log(`Error trying to add funding: ${err.message}`)
    }
  }

  const removeFunding = async () => {
    try {
      setStatus(Status.Loading)
      setMessage(
        `Remove all funding amount: ${formatBigNumber(
          marketMakerUserFunding,
          collateral.decimals,
        )} ...`,
      )

      const provider = context.library
      const user = await provider.getSigner().getAddress()
      const marketMaker = new MarketMakerService(
        marketMakerAddress,
        conditionalTokens,
        realitio,
        provider,
        user,
      )
      await marketMaker.removeFunding(marketMakerUserFunding)

      setStatus(Status.Ready)
    } catch (err) {
      setStatus(Status.Error)
      logger.log(`Error trying to remove funding: ${err.message}`)
    }
  }

  return (
    <>
      <SectionTitle title={question} subTitle={resolution ? formatDate(resolution) : ''} />
      <ViewCard>
        <SubsectionTitle>Totals</SubsectionTitle>
        <TableStyled>
          <TR>
            <TD>Total funding</TD>
            <TD textAlign="right">
              {marketMakerFunding ? formatBigNumber(marketMakerFunding, collateral.decimals) : '0'}{' '}
            </TD>
          </TR>
          <TR>
            <TD>Your funding</TD>
            <TD textAlign="right">
              {marketMakerUserFunding
                ? formatBigNumber(marketMakerUserFunding, collateral.decimals)
                : '0'}{' '}
              ({marketMakerFundingPercentage && marketMakerFundingPercentage.toFixed(2)}%){' '}
            </TD>
          </TR>
          <TR>
            <TD>Total pool shares</TD>
            <TD textAlign="right">
              {totalPoolShares ? formatBigNumber(totalPoolShares, collateral.decimals) : '0'}{' '}
              <strong>shares</strong>
            </TD>
          </TR>
          <TR>
            <TD>Your pool shares</TD>
            <TD textAlign="right">
              {userPoolShares ? formatBigNumber(userPoolShares, collateral.decimals) : '0'} (
              {userPoolSharesPercentage && userPoolSharesPercentage.toFixed(2)}%){' '}
              <strong>shares</strong>
            </TD>
          </TR>
        </TableStyled>
        <SubsectionTitle>Balance</SubsectionTitle>
        <OutcomeTable
          balance={balance}
          disabledColumns={[
            OutcomeTableValue.CurrentPrice,
            OutcomeTableValue.Payout,
            OutcomeTableValue.PriceAfterTrade,
          ]}
          displayRadioSelection={false}
          collateral={collateral}
        />
        <AmountWrapper
          formField={
            <>
              <TextfieldCustomPlaceholder
                formField={
                  <BigNumberInput
                    name="amount"
                    value={amount}
                    onChange={(e: BigNumberInputReturn) => setAmount(e.value)}
                    decimals={collateral.decimals}
                  />
                }
                placeholderText={collateral.symbol}
              />
            </>
          }
          title={'Amount'}
          note={
            <BalanceToken
              collateral={collateral}
              onClickMax={(collateral: Token, collateralBalance: BigNumber) => {
                setAmount(collateralBalance)
              }}
            />
          }
        />
        <ButtonContainerStyled>
          <ButtonLinkStyled onClick={() => props.history.push(`/${marketMakerAddress}`)}>
            ‹ Back
          </ButtonLinkStyled>

          <Button onClick={() => addFunding()} fontSize={'18px'} disabled={amount.isZero()}>
            Add funding
          </Button>
          <Button
            disabled={marketMakerUserFunding && marketMakerUserFunding.isZero()}
            backgroundColor={theme.colors.secondary}
            onClick={() => removeFunding()}
            fontSize={'18px'}
          >
            Remove all funding
          </Button>
        </ButtonContainerStyled>
      </ViewCard>
      {status === Status.Loading ? <FullLoading message={message} /> : null}
    </>
  )
}

export const MarketFund = withRouter(withTheme(MarketFundWrapper))
