import React from 'react'
import styled from 'styled-components'

import { Table, TD, TH, THead, TR } from '../table/index'
import { RadioInput } from '../radio_input/index'
import { formatBigNumber } from '../../../util/tools'
import { BalanceItem, OutcomeTableValue, Token } from '../../../util/types'
import { BarDiagram } from '../bar_diagram_probabilities'

interface Props {
  balances: BalanceItem[]
  collateral: Token
  pricesAfterTrade?: number[]
  outcomeSelected?: number
  outcomeHandleChange?: (e: number) => void
  disabledColumns?: OutcomeTableValue[]
  withWinningOutcome?: boolean
  displayRadioSelection?: boolean
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
    balances,
    collateral,
    pricesAfterTrade,
    outcomeSelected,
    outcomeHandleChange,
    disabledColumns = [],
    withWinningOutcome = false,
    displayRadioSelection = true,
  } = props

  const TableHead: OutcomeTableValue[] = [
    OutcomeTableValue.Probabilities,
    OutcomeTableValue.CurrentPrice,
    OutcomeTableValue.Shares,
    OutcomeTableValue.Payout,
    OutcomeTableValue.PriceAfterTrade,
  ]

  const outcomeMaxProbability = balances.reduce(
    (max, balance, index, balances) =>
      balance.probability > balances[max].probability ? index : max,
    0,
  )

  const TableCellsAlign = ['left', 'right', 'right', 'right', 'right']

  const renderTableHeader = () => {
    return (
      <THead>
        <TR>
          {displayRadioSelection && <TH />}
          {TableHead.map((value, index) => {
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

  const renderTableRow = (
    balanceItem: BalanceItem,
    outcomeIndex: number,
    priceAfterTrade?: number,
  ) => {
    const { outcomeName, probability, currentPrice, shares, winningOutcome } = balanceItem
    const isWinning = outcomeIndex === outcomeMaxProbability

    const currentPriceFormatted = Number(currentPrice).toFixed(4)

    return (
      <TR key={outcomeName}>
        {!displayRadioSelection || withWinningOutcome ? null : (
          <TD textAlign={TableCellsAlign[0]}>
            <RadioContainer>
              <RadioInputStyled
                data-testid={`outcome_table_radio_${balanceItem.outcomeName}`}
                checked={outcomeSelected === outcomeIndex}
                name="outcome"
                onChange={(e: any) => outcomeHandleChange && outcomeHandleChange(+e.target.value)}
                value={outcomeIndex}
              />
            </RadioContainer>
          </TD>
        )}
        {disabledColumns.includes(OutcomeTableValue.Probabilities) ? null : withWinningOutcome ? (
          <TDStyled textAlign={TableCellsAlign[1]} winningOutcome={winningOutcome}>
            <BarDiagram
              outcomeName={outcomeName}
              isWinning={isWinning}
              probability={probability}
              withWinningOutcome={withWinningOutcome}
              winningOutcome={winningOutcome}
            />
          </TDStyled>
        ) : (
          <TD textAlign={TableCellsAlign[1]}>
            <BarDiagram
              outcomeName={outcomeName}
              isWinning={isWinning}
              probability={probability}
              withWinningOutcome={withWinningOutcome}
              winningOutcome={winningOutcome}
            />
          </TD>
        )}
        {disabledColumns.includes(OutcomeTableValue.CurrentPrice) ? null : withWinningOutcome ? (
          <TDStyled textAlign={TableCellsAlign[2]} winningOutcome={winningOutcome}>
            {currentPriceFormatted} <strong>{collateral.symbol}</strong>
          </TDStyled>
        ) : (
          <TD textAlign={TableCellsAlign[2]}>
            {currentPriceFormatted} <strong>{collateral.symbol}</strong>
          </TD>
        )}
        {disabledColumns.includes(OutcomeTableValue.Shares) ? null : withWinningOutcome ? (
          <TDStyled textAlign={TableCellsAlign[3]} winningOutcome={winningOutcome}>
            {formatBigNumber(shares, collateral.decimals)}
          </TDStyled>
        ) : (
          <TD textAlign={TableCellsAlign[3]}>{formatBigNumber(shares, collateral.decimals)}</TD>
        )}
        {disabledColumns.includes(OutcomeTableValue.Payout) ? null : withWinningOutcome ? (
          <TDStyled textAlign={TableCellsAlign[4]} winningOutcome={winningOutcome}>
            {formatBigNumber(shares, collateral.decimals)}
          </TDStyled>
        ) : (
          <TD textAlign={TableCellsAlign[4]}>{formatBigNumber(shares, collateral.decimals)}</TD>
        )}
        {disabledColumns.includes(OutcomeTableValue.PriceAfterTrade) ? null : withWinningOutcome ? (
          <TDStyled textAlign={TableCellsAlign[5]} winningOutcome={winningOutcome}>
            {priceAfterTrade && priceAfterTrade.toFixed(4)} <strong>{collateral.symbol}</strong>
          </TDStyled>
        ) : (
          <TD textAlign={TableCellsAlign[5]}>
            {priceAfterTrade && priceAfterTrade.toFixed(4)} <strong>{collateral.symbol}</strong>
          </TD>
        )}
      </TR>
    )
  }

  const renderTable = () =>
    balances
      .sort((a, b) => (a.winningOutcome === b.winningOutcome ? 0 : a.winningOutcome ? -1 : 1)) // Put winning outcome first
      .map((balanceItem: BalanceItem, index) =>
        renderTableRow(balanceItem, index, pricesAfterTrade && pricesAfterTrade[index]),
      )

  return <TableStyled head={renderTableHeader()}>{renderTable()}</TableStyled>
}
