import React, { FC, useState } from 'react'
import styled, { withTheme } from 'styled-components'
import { BigNumber } from 'ethers/utils'

import { SectionTitle } from '../common/section_title'
import { formatDate } from '../../util/tools'
import { ViewCard } from '../common/view_card/'
import { Table, TD, TR } from '../common/table'
import { ethers } from 'ethers'
import { BalanceItem, OutcomeTableValue, Status, WinnerOutcome } from '../../util/types'
import { OutcomeTable } from '../common/outcome_table'
import { FullLoading } from '../common/full_loading'
import { SubsectionTitle } from '../common/subsection_title'
import { BigNumberInput, BigNumberInputReturn } from '../common/big_number_input'
import { FormRow } from '../common/form_row'
import { TextfieldCustomPlaceholder } from '../common/textfield_custom_placeholder'
import { ButtonContainer } from '../common/button_container'
import { Button } from '../common/button'

interface Props {
  marketMakerAddress: string
  question: string
  resolution: Maybe<Date>
  totalPoolShares: BigNumber
  userPoolShares: BigNumber
  userPoolSharesPercentage: number
  marketMakerFunding: BigNumber
  marketMakerUserFunding: BigNumber
  marketMakerFundingPercentage: number
  balance: BalanceItem[]
  winnerOutcome: Maybe<WinnerOutcome>
  status: Status
  theme?: any
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

const MarketFundWrapper: FC<Props> = props => {
  const {
    question,
    resolution,
    totalPoolShares,
    userPoolShares,
    userPoolSharesPercentage,
    balance,
    status,
    marketMakerUserFunding,
    marketMakerFunding,
    marketMakerFundingPercentage,
    theme,
  } = props

  const [amount, setAmount] = useState<BigNumber>(new BigNumber(0))

  return (
    <>
      <SectionTitle title={question} subTitle={resolution ? formatDate(resolution) : ''} />
      <ViewCard>
        <SubsectionTitle>Totals</SubsectionTitle>
        <TableStyled>
          <TR>
            <TD>Total funding</TD>
            <TD textAlign="right">
              {marketMakerFunding ? ethers.utils.formatUnits(marketMakerFunding, 18) : '0'}{' '}
              <strong>DAI</strong>
            </TD>
          </TR>
          <TR>
            <TD>Your funding</TD>
            <TD textAlign="right">
              {marketMakerUserFunding ? ethers.utils.formatUnits(marketMakerUserFunding, 18) : '0'}{' '}
              ({marketMakerFundingPercentage ? marketMakerFundingPercentage.toFixed(2) : '0'} %){' '}
              <strong>DAI</strong>
            </TD>
          </TR>
          <TR>
            <TD>Total pool shares</TD>
            <TD textAlign="right">
              {totalPoolShares ? ethers.utils.formatUnits(totalPoolShares, 18) : '0'}{' '}
              <strong>shares</strong>
            </TD>
          </TR>
          <TR>
            <TD>Your pool shares</TD>
            <TD textAlign="right">
              {userPoolShares ? ethers.utils.formatUnits(userPoolShares, 18) : '0'} (
              {userPoolSharesPercentage ? userPoolSharesPercentage.toFixed(2) : '0'} %){' '}
              <strong>shares</strong>
            </TD>
          </TR>
        </TableStyled>
        <SubsectionTitle>Balance</SubsectionTitle>
        <OutcomeTable
          balance={balance}
          disabledColumns={[
            OutcomeTableValue.Probabilities,
            OutcomeTableValue.CurrentPrice,
            OutcomeTableValue.Payout,
            OutcomeTableValue.PriceAfterTrade,
          ]}
          displayRadioSelection={false}
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
                    decimals={18}
                  />
                }
                placeholderText="DAI"
              />
            </>
          }
          title={'Amount'}
        />
        <ButtonContainerStyled>
          <Button onClick={() => null}>Add funding</Button>
          <Button backgroundColor={theme.colors.secondary} onClick={() => null}>
            Remove funding
          </Button>
        </ButtonContainerStyled>
      </ViewCard>
      {status === Status.Loading ? <FullLoading /> : null}
    </>
  )
}

export const MarketFund = withTheme(MarketFundWrapper)
