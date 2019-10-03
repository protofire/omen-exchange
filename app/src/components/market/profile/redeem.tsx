import React from 'react'
import styled from 'styled-components'

import { ViewCard } from '../view_card'
import { Button } from '../../common'
// import { FullLoading } from '../../common/full_loading'
import { ButtonContainer } from '../../common/button_container'
import { Table, TD, TH, THead, TR } from '../../common/table'
import { SubsectionTitle } from '../../common/subsection_title'
import { ClosedMarket } from '../../common/closed_market'
import { BalanceItems } from '../../../util/types'
import { formatBN } from '../../../util/tools'

const TDStyled = styled(TD)<{ winningOutcome?: boolean }>`
  color: ${props => (props.winningOutcome ? props.theme.colors.primary : 'inherit')};
  font-weight: ${props => (props.winningOutcome ? '700' : '400')};
  opacity: ${props => (props.winningOutcome ? '1' : '0.35')};
`

TDStyled.defaultProps = {
  winningOutcome: false,
}

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
  handleFinish: () => void
  balance: BalanceItems[]
  marketAddress: string
}

export const Redeem = (props: Props) => {
  const { handleFinish, balance } = props
  const TableHead = ['Outcome', 'Shares', 'Price', 'Payout']
  const TableCellsAlign = ['left', 'right', 'right', 'right']

  const renderTableHeader = (): React.ReactNode => {
    return (
      <THead>
        <TR>
          {TableHead.map((value, index) => {
            return (
              <TH key={index} textAlign={TableCellsAlign[index]}>
                {value}
              </TH>
            )
          })}
        </TR>
      </THead>
    )
  }

  const renderTableData = () => {
    return balance.map((balanceItem: any, index: number) => {
      const { outcomeName, currentPrice, shares } = balanceItem
      return (
        <TR key={index}>
          <TDStyled textAlign={TableCellsAlign[0]}>{outcomeName}</TDStyled>
          <TDStyled textAlign={TableCellsAlign[1]}>{formatBN(shares)}</TDStyled>
          <TDStyled textAlign={TableCellsAlign[2]}>{currentPrice} DAI</TDStyled>
          <TDStyled textAlign={TableCellsAlign[3]}>NONE</TDStyled>
        </TR>
      )
    })
  }

  return (
    <>
      <ClosedMarket date={'Nov 30 2019 00:00:00 GMT-0300'} />
      <ViewCard>
        <SubsectionTitle>Balance</SubsectionTitle>
        <Table head={renderTableHeader()}>{renderTableData()}</Table>
        <ButtonContainerStyled>
          <Button onClick={() => handleFinish()}>Redeem</Button>
        </ButtonContainerStyled>
      </ViewCard>
      {/* {status === Status.Loading ? <FullLoading /> : null} */}
    </>
  )
}
