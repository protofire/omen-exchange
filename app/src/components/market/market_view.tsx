import React from 'react'
import styled from 'styled-components'
import { ethers } from 'ethers'
import { formatDate } from '../../util/tools'
import { Status, BalanceItems } from '../../util/types'
import { Button } from '../common/button'

interface Props {
  balance: BalanceItems[]
  question: string
  resolution: Date
  status: Status
  handleBuy: () => any
  handleSell: () => any
}

const DivStyled = styled.div`
  width: 5px;
  height: auto;
  display: inline-block;
`

const MarketView = (props: Props) => {
  const { balance, question, resolution } = props

  const renderTableHeader = ['Outcome', 'Probabilities', 'Current Price', 'Shares'].map(
    (value, index) => {
      return <th key={index}>{value}</th>
    },
  )

  const renderTableData = balance.map((balanceItem: BalanceItems, index: number) => {
    const { outcomeName, probability, currentPrice, shares } = balanceItem
    return (
      <tr key={index}>
        <td>{outcomeName}</td>
        <td>{probability} %</td>
        <td>{ethers.utils.formatEther(currentPrice)} DAI</td>
        <td>{shares}</td>
      </tr>
    )
  })

  return (
    <div className="row">
      <div className="col-2" />
      <div className="col-6">
        <h4>{question}</h4>
        <h5>Resolution date: {formatDate(resolution)}</h5>
        <h5>Balance</h5>
        <table>
          <tbody>
            <tr>{renderTableHeader}</tr>
            {renderTableData}
          </tbody>
        </table>
        <div className="row right">
          <Button onClick={() => props.handleSell()}>Sell</Button>
          <DivStyled />
          <Button onClick={() => props.handleBuy()}>Buy</Button>
        </div>
      </div>
      <div className="col-2" />
    </div>
  )
}

export { MarketView }
