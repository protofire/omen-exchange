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
  probabilities: number[]
  outcomeSelected?: number
  outcomeHandleChange?: (e: number) => void
  disabledColumns?: OutcomeTableValue[]
  withWinningOutcome?: boolean
  displayRadioSelection?: boolean
}

const TableWrapper = styled.div`
  margin-bottom: 30px;
`

const TDStyled = styled(TD)<{ winningOutcome?: boolean }>`
  color: ${props => (props.winningOutcome ? props.theme.colors.primary : 'inherit')};
  font-weight: ${props => (props.winningOutcome ? '700' : '400')};
  opacity: ${props => (props.winningOutcome ? '1' : '0.35')};
`

const TDNoHorizontalPadding = styled(TD)`
  padding-left: 0;
  padding-right: 0;
`

TDStyled.defaultProps = {
  winningOutcome: false,
}

export const OutcomeTable = (props: Props) => {
  const {
    balances,
    collateral,
    probabilities,
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
  ]

  const outcomeMaxProbability = probabilities.reduce(
    (max, balance, index, balances) => (balance > balances[max] ? index : max),
    0,
  )

  const equalProbabilities = probabilities.every(b => b === probabilities[0])

  const TableCellsAlign = ['left', 'right', 'right', 'right', 'right', 'right']

  const renderTableHeader = () => {
    return (
      <THead>
        <TR>
          {TableHead.map((value, index) => {
            return !disabledColumns.includes(value) ? (
              <TH
                colSpan={index === 0 && displayRadioSelection ? 2 : 1}
                textAlign={TableCellsAlign[index]}
                key={index}
              >
                {value}
              </TH>
            ) : null
          })}
        </TR>
      </THead>
    )
  }

  const renderTableRow = (balanceItem: BalanceItem, outcomeIndex: number) => {
    const { outcomeName, currentPrice, shares, winningOutcome } = balanceItem
    const isWinning = !equalProbabilities && outcomeIndex === outcomeMaxProbability

    const currentPriceFormatted = Number(currentPrice).toFixed(4)

    const probability = probabilities[outcomeIndex]

    return (
      <TR key={outcomeName}>
        {!displayRadioSelection || withWinningOutcome ? null : (
          <TDNoHorizontalPadding textAlign={TableCellsAlign[0]}>
            <RadioInput
              checked={outcomeSelected === outcomeIndex}
              data-testid={`outcome_table_radio_${balanceItem.outcomeName}`}
              name="outcome"
              onChange={(e: any) => outcomeHandleChange && outcomeHandleChange(+e.target.value)}
              value={outcomeIndex}
            />
          </TDNoHorizontalPadding>
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
      </TR>
    )
  }

  const renderTable = () =>
    balances
      .sort((a, b) => (a.winningOutcome === b.winningOutcome ? 0 : a.winningOutcome ? -1 : 1)) // Put winning outcome first
      .map((balanceItem: BalanceItem, index) => renderTableRow(balanceItem, index))

  return (
    <TableWrapper>
      <Table maxHeight="266px" head={renderTableHeader()}>
        {renderTable()}
      </Table>
    </TableWrapper>
  )
}
