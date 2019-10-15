import React, { FC } from 'react'
import styled from 'styled-components'
import { BigNumber } from 'ethers/utils'

import { SectionTitle } from '../common/section_title'
import { formatDate } from '../../util/tools'
import { ViewCard } from '../common/view_card/'
import { Table, TD, TR } from '../common/table'
import { FormLabel } from '../common/form_label'
import { ethers } from 'ethers'
import { BalanceItem, OutcomeTableValue, Status, WinnerOutcome } from '../../util/types'
import { OutcomeTable } from '../common/outcome_table'
import { FullLoading } from '../common/full_loading'
import { SubsectionTitle } from '../common/subsection_title'

interface Props {
  marketMakerAddress: string
  question: string
  resolution: Maybe<Date>
  totalPoolShares: BigNumber
  userPoolShares: BigNumber
  marketFunding: BigNumber
  userPoolSharesPercentage: number
  balance: BalanceItem[]
  winnerOutcome: Maybe<WinnerOutcome>
  status: Status
}

const TableStyled = styled(Table)`
  margin-bottom: 30px;
`

const FormLabelStyled = styled(FormLabel)`
  margin-bottom: 10px;
`

const MarketFund: FC<Props> = props => {
  const {
    question,
    resolution,
    totalPoolShares,
    userPoolShares,
    userPoolSharesPercentage,
    balance,
    status,
  } = props

  return (
    <>
      <SectionTitle title={question} subTitle={resolution ? formatDate(resolution) : ''} />
      <ViewCard>
        <SubsectionTitle>Totals</SubsectionTitle>
        <TableStyled>
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
      </ViewCard>
      {status === Status.Loading ? <FullLoading /> : null}
    </>
  )
}

export { MarketFund }
