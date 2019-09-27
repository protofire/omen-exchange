import React from 'react'
import styled from 'styled-components'
import { ethers } from 'ethers'

import { Status, BalanceItems } from '../../../util/types'
import { Button } from '../../common'

interface Props {
  balance: BalanceItems[]
  question: string
  resolution: Date
  status: Status
  handleBuy: () => void
  handleSell: () => void
}

const DivStyled = styled.div`
  width: 5px;
  height: auto;
  display: inline-block;
`

const TableStyled = styled.table`
  width: 100%;
`

const THStyled = styled.th`
  border-bottom: 1px solid #ddd;
`

const TDStyled = styled.th`
  border-bottom: 1px solid #ddd;
`

const View = (props: Props) => {
  const { balance, status } = props

  const userHaveShares = balance.some((balanceItem: BalanceItems) => {
    const { shares } = balanceItem
    return !shares.isZero()
  })

  const headerArray = ['Outcome', 'Probabilities', 'Current Price', 'Shares']
  if (!userHaveShares) {
    headerArray.pop()
  }

  const renderTableHeader = headerArray.map((value, index) => {
    return <THStyled key={index}>{value}</THStyled>
  })

  const renderTableData = balance.map((balanceItem: BalanceItems, index: number) => {
    const { outcomeName, probability, currentPrice, shares } = balanceItem
    return (
      <tr key={index}>
        <TDStyled>{outcomeName}</TDStyled>
        <TDStyled>{probability} %</TDStyled>
        <TDStyled>{currentPrice} DAI</TDStyled>
        {userHaveShares && <TDStyled>{ethers.utils.formatEther(shares)}</TDStyled>}
      </tr>
    )
  })

  return (
    <>
      {userHaveShares && <h5>Balance</h5>}
      <div className="row">
        <TableStyled>
          <tbody>
            <tr>{renderTableHeader}</tr>
            {renderTableData}
          </tbody>
        </TableStyled>
      </div>
      <div className="row">
        <p>Status: {status}</p>
      </div>
      <div className="row right">
        {userHaveShares && <Button onClick={() => props.handleSell()}>Sell</Button>}
        <DivStyled />
        <Button onClick={() => props.handleBuy()}>Buy</Button>
      </div>
    </>
  )
}

export { View }
