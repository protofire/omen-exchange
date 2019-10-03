import React from 'react'
import styled, { withTheme } from 'styled-components'
import { ViewCard } from '../view_card'
import { Button } from '../../common'
// import { FullLoading } from '../../common/full_loading'
import { ButtonContainer } from '../../common/button_container'
import { Table, TD, TH, THead, TR } from '../../common/table'
import { SubsectionTitle } from '../../common/subsection_title'
import { TitleValue } from '../../common/title_value'
import { ClosedMarket } from '../../common/closed_market'
import { WinnerOutcome } from '../../../util/types'

const TDStyled = styled(TD)<{ winningOutcome?: boolean }>`
  color: ${props => (props.winningOutcome ? props.theme.colors.primary : 'inherit')};
  font-weight: ${props => (props.winningOutcome ? '700' : '400')};
  opacity: ${props => (props.winningOutcome ? '1' : '0.35')};
`

TDStyled.defaultProps = {
  winningOutcome: false,
}

const TableStyled = styled(Table)`
  margin-bottom: 30px;
`

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
  handleFinish: () => void
  theme?: any
  winnerOutcome: Maybe<WinnerOutcome>
}

export const WithdrawWrapper = (props: Props) => {
  const { handleFinish, theme, winnerOutcome } = props
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

  //TODO: Get real data
  const balance = [
    {
      winningOutcome: winnerOutcome === WinnerOutcome.Yes,
      outcomeName: 'Yes',
      payout: '35',
      currentPrice: '75',
      shares: '50',
    },
    {
      winningOutcome: winnerOutcome === WinnerOutcome.No,
      outcomeName: 'No',
      payout: '75',
      currentPrice: '35',
      shares: '25',
    },
  ]

  const renderTableData = () => {
    return balance.map((balanceItem: any, index: number) => {
      const { outcomeName, payout, currentPrice, shares, winningOutcome } = balanceItem
      return (
        <TR key={index}>
          <TDStyled winningOutcome={winningOutcome} textAlign={TableCellsAlign[0]}>
            {outcomeName}
          </TDStyled>
          <TDStyled winningOutcome={winningOutcome} textAlign={TableCellsAlign[1]}>
            {shares}
          </TDStyled>
          <TDStyled winningOutcome={winningOutcome} textAlign={TableCellsAlign[2]}>
            {currentPrice} DAI
          </TDStyled>
          <TDStyled winningOutcome={winningOutcome} textAlign={TableCellsAlign[3]}>
            {payout}
          </TDStyled>
        </TR>
      )
    })
  }

  return (
    <>
      <ClosedMarket date={'Nov 30 2019 00:00:00 GMT-0300'} />
      <ViewCard>
        {<SubsectionTitle>Balance</SubsectionTitle>}
        <TableStyled head={renderTableHeader()}>{renderTableData()}</TableStyled>
        <SubsectionTitle>Details</SubsectionTitle>
        <Grid>
          <TitleValue title="Category" value="Politics" />
          <TitleValue title="Oracle" value="realit.io and dxDAO" />
          <TitleValue title="Resolution Date" value="Sep 25 2019 09:00:00 GMT-0300" />
          <TitleValue title="Fee" value="1%" />
          <TitleValue title="Funding" value="1000 DAI" />
        </Grid>
        <SubsectionTitle>Market Results</SubsectionTitle>
        <Grid>
          <TitleValue title="Collateral" value="10000 DAI" />
        </Grid>
        <ButtonContainerStyled>
          <Button onClick={() => handleFinish()}>Redeem</Button>
          <Button backgroundColor={theme.colors.secondary} onClick={() => handleFinish()}>
            Withdraw Collateral
          </Button>
        </ButtonContainerStyled>
      </ViewCard>
      {/* {status === Status.Loading ? <FullLoading /> : null} */}
    </>
  )
}

export const Withdraw = withTheme(WithdrawWrapper)
