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

const View = (props: Props) => {
  const { balance, status } = props

  const userHaveShares = balance.some((balanceItem: BalanceItems) => {
    const { shares } = balanceItem
    return shares.isZero()
  })

  const headerArray = ['Outcome', 'Probabilities', 'Current Price', 'Shares']
  if (!userHaveShares) {
    headerArray.pop()
  }

  const renderTableHeader = headerArray.map((value, index) => {
    return <th key={index}>{value}</th>
  })

  const renderTableData = balance.map((balanceItem: BalanceItems, index: number) => {
    const { outcomeName, probability, currentPrice, shares } = balanceItem
    return (
      <tr key={index}>
        <td>{outcomeName}</td>
        <td>{probability} %</td>
        <td>{currentPrice} DAI</td>
        {userHaveShares && <td>{ethers.utils.formatEther(shares)}</td>}
      </tr>
    )
  })

  return (
    <>
      {userHaveShares && <h5>Balance</h5>}
      Status: {status}
      <table>
        <tbody>
          <tr>{renderTableHeader}</tr>
          {renderTableData}
        </tbody>
      </table>
      <div className="row right">
        {userHaveShares && <Button onClick={() => props.handleSell()}>Sell</Button>}
        <DivStyled />
        <Button onClick={() => props.handleBuy()}>Buy</Button>
      </div>
    </>
  )
}

export { View }
