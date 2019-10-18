import React from 'react'
import styled from 'styled-components'

import { Table, TD, TH, THead, TR } from '../table/index'
import { RadioInput } from '../radio_input/index'
import { BalanceItem, OutcomeSlot, OutcomeTableValue, Token } from '../../../util/types'
import { ethers } from 'ethers'

interface Props {
  balance: BalanceItem[]
  collateral: Token
  pricesAfterTrade?: [number, number]
  outcomeSelected?: OutcomeSlot
  outcomeHandleChange?: (e: OutcomeSlot) => void
  disabledColumns?: OutcomeTableValue[]
  withWinningOutcome?: boolean
}

const TableStyled = styled(Table)`
  margin-bottom: 30px;
`

const TDStyled = styled(TD)<{ winningOutcome?: boolean }>`
  color: ${props => (props.winningOutcome ? props.theme.colors.primary : 'inherit')};
  font-weight: ${props => (props.winningOutcome ? '700' : '400')};
  opacity: ${props => (props.winningOutcome ? '1' : '0.35')};
`

TDStyled.defaultProps = {
  winningOutcome: false,
}

const RadioContainer = styled.label`
  align-items: center;
  display: flex;
  white-space: nowrap;
`

const RadioInputStyled = styled(RadioInput)`
  margin-right: 6px;
`

export const OutcomeTable = (props: Props) => {
  const {
    balance,
    collateral,
    pricesAfterTrade,
    outcomeSelected,
    outcomeHandleChange,
    disabledColumns = [],
    withWinningOutcome = false,
  } = props

  const TableHead: OutcomeTableValue[] = [
    OutcomeTableValue.Outcome,
    OutcomeTableValue.Probabilities,
    OutcomeTableValue.CurrentPrice,
    OutcomeTableValue.Shares,
    OutcomeTableValue.Payout,
    OutcomeTableValue.PriceAfterTrade,
  ]

  const TableCellsAlign = ['left', 'right', 'right', 'right', 'right', 'right']

  const renderTableHeader = () => {
    return (
      <THead>
        <TR>
          {TableHead.map((value: OutcomeTableValue, index: number) => {
            return !disabledColumns.includes(value) ? (
              <TH textAlign={TableCellsAlign[index]} key={index}>
                {value}
              </TH>
            ) : null
          })}
        </TR>
      </THead>
    )
  }

  const renderTableData = balance.map((balanceItem: BalanceItem, index: number) => {
    const { outcomeName, probability, currentPrice, shares, winningOutcome } = balanceItem

    return (
      <TR key={index}>
        {disabledColumns.includes(OutcomeTableValue.Outcome) ? null : withWinningOutcome ? (
          <TDStyled textAlign={TableCellsAlign[0]} winningOutcome={winningOutcome}>
            {outcomeName}
          </TDStyled>
        ) : (
          <TD textAlign={TableCellsAlign[0]}>
            <RadioContainer>
              <RadioInputStyled
                checked={outcomeSelected === outcomeName}
                name="outcome"
                onChange={(e: any) =>
                  outcomeHandleChange && outcomeHandleChange(e.target.value as OutcomeSlot)
                }
                value={outcomeName}
              />
              {outcomeName}
            </RadioContainer>
          </TD>
        )}
        {disabledColumns.includes(OutcomeTableValue.Probabilities) ? null : withWinningOutcome ? (
          <TDStyled textAlign={TableCellsAlign[1]} winningOutcome={winningOutcome}>
            {probability} %
          </TDStyled>
        ) : (
          <TD textAlign={TableCellsAlign[1]}>{probability} %</TD>
        )}
        {disabledColumns.includes(OutcomeTableValue.CurrentPrice) ? null : withWinningOutcome ? (
          <TDStyled textAlign={TableCellsAlign[2]} winningOutcome={winningOutcome}>
            {currentPrice} <strong>{collateral.symbol}</strong>
          </TDStyled>
        ) : (
          <TD textAlign={TableCellsAlign[2]}>
            {currentPrice} <strong>{collateral.symbol}</strong>
          </TD>
        )}
        {disabledColumns.includes(OutcomeTableValue.Shares) ? null : withWinningOutcome ? (
          <TDStyled textAlign={TableCellsAlign[3]} winningOutcome={winningOutcome}>
            {ethers.utils.formatUnits(shares, collateral.decimals)}
          </TDStyled>
        ) : (
          <TD textAlign={TableCellsAlign[3]}>
            {ethers.utils.formatUnits(shares, collateral.decimals)}
          </TD>
        )}
        {disabledColumns.includes(OutcomeTableValue.Payout) ? null : withWinningOutcome ? (
          <TDStyled textAlign={TableCellsAlign[4]} winningOutcome={winningOutcome}>
            {ethers.utils.formatUnits(shares, collateral.decimals)}
          </TDStyled>
        ) : (
          <TD textAlign={TableCellsAlign[4]}>
            {ethers.utils.formatUnits(shares, collateral.decimals)}
          </TD>
        )}
        {disabledColumns.includes(OutcomeTableValue.PriceAfterTrade) ? null : withWinningOutcome ? (
          <TDStyled textAlign={TableCellsAlign[5]} winningOutcome={winningOutcome}>
            {pricesAfterTrade && pricesAfterTrade[index].toFixed(4)}{' '}
            <strong>{collateral.symbol}</strong>
          </TDStyled>
        ) : (
          <TD textAlign={TableCellsAlign[5]}>
            {pricesAfterTrade && pricesAfterTrade[index].toFixed(4)}{' '}
            <strong>{collateral.symbol}</strong>
          </TD>
        )}
      </TR>
    )
  })

  return <TableStyled head={renderTableHeader()}>{renderTableData}</TableStyled>
}
