import React from 'react'
import styled, { css } from 'styled-components'

import { IS_CORONA_VERSION } from '../../../common/constants'
import { formatBigNumber } from '../../../util/tools'
import { BalanceItem, OutcomeTableValue, Token } from '../../../util/types'
import { BarDiagram, NewValue, OwnedShares, RadioInput, TD, TH, THead, TR, Table } from '../../common'

interface Props {
  balances: BalanceItem[]
  collateral: Token
  disabledColumns?: OutcomeTableValue[]
  displayRadioSelection?: boolean
  outcomeHandleChange?: (e: number) => void
  outcomeSelected?: number
  probabilities: number[]
  withWinningOutcome?: boolean
}

const TableWrapper = styled.div`
  margin-left: -${props => props.theme.cards.paddingHorizontal};
  margin-right: -${props => props.theme.cards.paddingHorizontal};
  margin-top: 20px;
`

const PaddingCSS = css`
  padding-left: 25px;
  padding-right: 0;

  &:last-child {
    padding-right: 25px;
  }
`

const THStyled = styled(TH)`
  ${PaddingCSS}
`

const TDStyled = styled(TD)`
  ${PaddingCSS}
`
const TDRadio = styled(TD)`
  ${PaddingCSS}
  width: 20px;
`

const TDFlexDiv = styled.div<{ textAlign?: string }>`
  align-items: center;
  display: flex;
  justify-content: ${props =>
    props.textAlign && 'right' ? 'flex-end' : props.textAlign && 'center' ? 'center' : 'flex-start'};
`

const WinningOutcome = () => {
  return <>Winning Outcome</>
}

export const OutcomeTable = (props: Props) => {
  const {
    balances,
    collateral,
    disabledColumns = [],
    displayRadioSelection = true,
    outcomeHandleChange,
    outcomeSelected,
    probabilities,
    withWinningOutcome = false,
  } = props

  const TableHead: OutcomeTableValue[] = [
    OutcomeTableValue.Probabilities,
    OutcomeTableValue.CurrentPrice,
    OutcomeTableValue.Shares,
    OutcomeTableValue.Payout,
  ]

  const TableCellsAlign = ['left', 'center', 'right', 'right', 'right', 'right']

  const renderTableHeader = () => {
    return (
      <THead>
        <TR>
          {TableHead.map((value, index) => {
            return !disabledColumns.includes(value) ? (
              <THStyled
                colSpan={index === 0 && displayRadioSelection ? 2 : 1}
                key={index}
                textAlign={TableCellsAlign[index]}
              >
                {value} {value === OutcomeTableValue.CurrentPrice && `(${collateral.symbol})`}
              </THStyled>
            ) : null
          })}
        </TR>
      </THead>
    )
  }

  const renderTableRow = (balanceItem: BalanceItem, outcomeIndex: number) => {
    const { currentPrice, outcomeName, shares } = balanceItem
    const currentPriceFormatted = Number(currentPrice).toFixed(2)
    const probability = probabilities[outcomeIndex]
    const isOutcomeSelected = outcomeSelected === outcomeIndex
    const showSharesAndPriceChange = isOutcomeSelected && !IS_CORONA_VERSION

    return (
      <TR key={outcomeName}>
        {!displayRadioSelection || withWinningOutcome ? null : (
          <TDRadio textAlign={TableCellsAlign[0]}>
            <RadioInput
              checked={outcomeSelected === outcomeIndex}
              data-testid={`outcome_table_radio_${balanceItem.outcomeName}`}
              name="outcome"
              onChange={(e: any) => outcomeHandleChange && outcomeHandleChange(+e.target.value)}
              outcomeIndex={outcomeIndex}
              value={outcomeIndex}
            />
          </TDRadio>
        )}
        {disabledColumns.includes(OutcomeTableValue.Probabilities) ? null : withWinningOutcome ? (
          <TDStyled textAlign={TableCellsAlign[1]}>
            {balanceItem.winningOutcome && <WinningOutcome />}
            <BarDiagram outcomeIndex={outcomeIndex} outcomeName={outcomeName} probability={probability} />
            {showSharesAndPriceChange && <OwnedShares outcomeIndex={outcomeIndex} value="250.55" />}
          </TDStyled>
        ) : (
          <TDStyled textAlign={TableCellsAlign[1]}>
            <BarDiagram outcomeIndex={outcomeIndex} outcomeName={outcomeName} probability={probability} />
            {showSharesAndPriceChange && <OwnedShares outcomeIndex={outcomeIndex} value="250.55" />}
          </TDStyled>
        )}
        {disabledColumns.includes(OutcomeTableValue.CurrentPrice) ? null : withWinningOutcome ? (
          <TDStyled textAlign={TableCellsAlign[2]}>
            <TDFlexDiv textAlign={TableCellsAlign[2]}>
              {currentPriceFormatted}{' '}
              {showSharesAndPriceChange && <NewValue outcomeIndex={outcomeIndex} value="1.23" />}
            </TDFlexDiv>
          </TDStyled>
        ) : (
          <TDStyled textAlign={TableCellsAlign[2]}>
            <TDFlexDiv textAlign={TableCellsAlign[2]}>
              {currentPriceFormatted}{' '}
              {showSharesAndPriceChange && <NewValue outcomeIndex={outcomeIndex} value="1.23" />}
            </TDFlexDiv>
          </TDStyled>
        )}
        {disabledColumns.includes(OutcomeTableValue.Shares) ? null : withWinningOutcome ? (
          <TDStyled textAlign={TableCellsAlign[3]}>{formatBigNumber(shares, collateral.decimals)}</TDStyled>
        ) : (
          <TDStyled textAlign={TableCellsAlign[3]}>{formatBigNumber(shares, collateral.decimals)}</TDStyled>
        )}
        {disabledColumns.includes(OutcomeTableValue.Payout) ? null : withWinningOutcome ? (
          <TDStyled textAlign={TableCellsAlign[4]}>{formatBigNumber(shares, collateral.decimals)}</TDStyled>
        ) : (
          <TDStyled textAlign={TableCellsAlign[4]}>{formatBigNumber(shares, collateral.decimals)}</TDStyled>
        )}
      </TR>
    )
  }

  const renderTable = () =>
    balances
      .slice()
      .sort((a, b) => (a.winningOutcome === b.winningOutcome ? 0 : a.winningOutcome ? -1 : 1)) // Put winning outcome first
      .map((balanceItem: BalanceItem, index) => renderTableRow(balanceItem, index))

  return (
    <TableWrapper>
      <Table head={renderTableHeader()}>{renderTable()}</Table>
    </TableWrapper>
  )
}
