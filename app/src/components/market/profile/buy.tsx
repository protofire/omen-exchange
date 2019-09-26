import React from 'react'
import styled from 'styled-components'

import { Button } from '../../common'
import { BalanceItems } from '../../../util/types'

interface Props {
  balance: BalanceItems[]
  handleBack: () => void
  handleFinish: () => void
}

const DivStyled = styled.div`
  width: 5px;
  height: auto;
  display: inline-block;
`

const Buy = (props: Props) => {
  const { balance } = props

  const renderTableHeader = ['Outcome', 'Probabilities', 'Current Price'].map((value, index) => {
    return <th key={index}>{value}</th>
  })

  const renderTableData = balance.map((balanceItem: BalanceItems, index: number) => {
    const { outcomeName, probability, currentPrice } = balanceItem
    return (
      <tr key={index}>
        <td>
          <input type="radio" value={outcomeName} name="outcome" /> {outcomeName}
        </td>
        <td>{probability} %</td>
        <td>{currentPrice} DAI</td>
      </tr>
    )
  })

  return (
    <>
      <h6>Choose the shares you want to buy</h6>
      <table>
        <tbody>
          <tr>{renderTableHeader}</tr>
          {renderTableData}
        </tbody>
      </table>
      Amount
      <input name="valueToBuy"></input>DAI
      <h6>Totals</h6>
      <p>You spend: 75.75 DAI</p>
      <p>&quot;Yes&quot; shares you get 1 shares</p>
      <p>1 shares can be redeemed for 1 DAI in case it represents the final outcome.</p>
      <div className="row right">
        <Button onClick={() => props.handleBack()}>Back</Button>
        <DivStyled />
        <Button onClick={() => props.handleFinish()}>Finish</Button>
      </div>
    </>
  )
}

export { Buy }
