import React from 'react'
import styled, { withTheme } from 'styled-components'
import { ethers } from 'ethers'

import { ViewCard } from '../../common/view_card'
import { Status, BalanceItem, Token } from '../../../util/types'
import { Button } from '../../common'
import { FullLoading } from '../../common/full_loading'
import { ButtonContainer } from '../../common/button_container'
import { Table, TD, TH, THead, TR } from '../../common/table'
import { SubsectionTitle } from '../../common/subsection_title'
import { ThreeBoxComments } from '../../common'

interface Props {
  balance: BalanceItem[]
  collateral: Token
  question: string
  status: Status
  handleBuy: () => void
  handleSell: () => void
  handleRedeem: () => void
  handleWithdraw: () => void
  theme?: any
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

const ViewWrapper = (props: Props) => {
  const { balance, collateral, status, theme } = props

  const userHasShares = balance.some((balanceItem: BalanceItem) => {
    const { shares } = balanceItem
    return !shares.isZero()
  })

  const headerArray = ['Outcome', 'Probabilities', 'Current Price', 'Shares']
  const cellAlignment = ['left', 'right', 'right', 'right']
  if (!userHasShares) {
    headerArray.pop()
  }

  const renderTableHeader = (): React.ReactNode => {
    return (
      <THead>
        <TR>
          {headerArray.map((value, index) => {
            return (
              <TH key={index} textAlign={cellAlignment[index]}>
                {value}
              </TH>
            )
          })}
        </TR>
      </THead>
    )
  }

  const renderTableData = () => {
    return balance.map((balanceItem: BalanceItem, index: number) => {
      const { outcomeName, probability, currentPrice, shares } = balanceItem
      return (
        <TR key={index}>
          <TD textAlign={cellAlignment[0]}>{outcomeName}</TD>
          <TD textAlign={cellAlignment[1]}>{probability} %</TD>
          <TD textAlign={cellAlignment[2]}>
            {currentPrice} {collateral.symbol}
          </TD>
          {userHasShares && (
            <TD textAlign={cellAlignment[3]}>
              {ethers.utils.formatUnits(shares, collateral.decimals)}
            </TD>
          )}
        </TR>
      )
    })
  }

  return (
    <>
      <ViewCard>
        {userHasShares && <SubsectionTitle>Balance</SubsectionTitle>}
        <Table head={renderTableHeader()}>{renderTableData()}</Table>
        <ButtonContainerStyled>
          {userHasShares && (
            <Button backgroundColor={theme.colors.secondary} onClick={() => props.handleSell()}>
              Sell
            </Button>
          )}
          <Button onClick={() => props.handleBuy()}>Buy</Button>
        </ButtonContainerStyled>
        <ThreeBoxComments />
      </ViewCard>
      {status === Status.Loading ? <FullLoading /> : null}
    </>
  )
}

export const View = withTheme(ViewWrapper)
