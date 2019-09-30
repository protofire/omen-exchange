import React from 'react'
import { withTheme } from 'styled-components'
import { ViewCard } from '../view_card'
import { Status, BalanceItems } from '../../../util/types'
import { formatBN } from '../../../util/tools'
import { Button } from '../../common'
import { FullLoading } from '../../common/full_loading'
import { ButtonContainer } from '../../common/button_container'
import { Table, TD, TH, THead, TR } from '../../common/table'
import { SubsectionTitle } from '../../common/subsection_title'

interface Props {
  balance: BalanceItems[]
  question: string
  resolution: Date
  status: Status
  handleBuy: () => void
  handleSell: () => void
  handleRedeem: () => void
  handleWithdraw: () => void
  theme?: any
}

const ViewWrapper = (props: Props) => {
  const { balance, status, theme } = props

  const userHasShares = balance.some((balanceItem: BalanceItems) => {
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
    return balance.map((balanceItem: BalanceItems, index: number) => {
      const { outcomeName, probability, currentPrice, shares } = balanceItem
      return (
        <TR key={index}>
          <TD textAlign={cellAlignment[0]}>{outcomeName}</TD>
          <TD textAlign={cellAlignment[1]}>{probability} %</TD>
          <TD textAlign={cellAlignment[2]}>{currentPrice} DAI</TD>
          {userHasShares && <TD textAlign={cellAlignment[3]}>{formatBN(shares)}</TD>}
        </TR>
      )
    })
  }

  return (
    <>
      <ViewCard>
        {userHasShares && <SubsectionTitle>Balance</SubsectionTitle>}
        <Table head={renderTableHeader()}>{renderTableData()}</Table>
        <ButtonContainer>
          <span onClick={() => props.handleWithdraw()}>Withdraw </span>&nbsp;
          <span onClick={() => props.handleRedeem()}>Redeem</span>
          {userHasShares && (
            <Button backgroundColor={theme.colors.secondary} onClick={() => props.handleSell()}>
              Sell
            </Button>
          )}
          <Button onClick={() => props.handleBuy()}>Buy</Button>
        </ButtonContainer>
      </ViewCard>
      {status === Status.Loading ? <FullLoading /> : null}
    </>
  )
}

export const View = withTheme(ViewWrapper)
