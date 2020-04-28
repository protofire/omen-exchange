import React from 'react'
import styled, { css } from 'styled-components'

import { formatBigNumber, mulBN } from '../../../../util/tools'
import { BalanceItem, OutcomeTableValue, Token } from '../../../../util/types'
import { RadioInput, TD, TH, THead, TR, Table } from '../../../common'
import { BarDiagram } from '../bar_diagram_probabilities'
import { OutcomeItemLittleBallOfJoyAndDifferentColors, OutcomeItemText, OutcomeItemTextWrapper } from '../common_styled'
import { NewValue } from '../new_value'
import { OwnedShares } from '../owned_shares'
import { RedeemAmount } from '../redeem_amount'
import { WinningBadge } from '../winning_badge'

interface Props {
  balances: BalanceItem[]
  collateral: Token
  disabledColumns?: OutcomeTableValue[]
  displayRadioSelection?: boolean
  outcomeHandleChange?: (e: number) => void
  outcomeSelected?: number
  payouts?: Maybe<number[]>
  probabilities: number[]
  withWinningOutcome?: boolean
  showPriceChange?: boolean
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

const WinningBadgeStyled = styled(WinningBadge)`
  flex-grow: 1;
  margin-right: auto;
`

export const OutcomeTable = (props: Props) => {
  const {
    balances,
    collateral,
    disabledColumns = [],
    displayRadioSelection = true,
    outcomeHandleChange,
    outcomeSelected,
    payouts = [],
    probabilities,
    withWinningOutcome = false,
    showPriceChange = false,
  } = props

  const TableHead: OutcomeTableValue[] = [
    OutcomeTableValue.OutcomeProbability,
    OutcomeTableValue.Outcome,
    OutcomeTableValue.Probability,
    OutcomeTableValue.CurrentPrice,
    OutcomeTableValue.Shares,
    OutcomeTableValue.Payout,
  ]

  const TableCellsAlign = ['left', 'left', 'right', 'right', 'right', 'right']

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
    const { currentPrice, outcomeName, payout, shares } = balanceItem
    const currentPriceFormatted = withWinningOutcome ? payout : Number(currentPrice).toFixed(2)
    const probability = withWinningOutcome ? payout * 100 : probabilities[outcomeIndex]
    const newPrice = (probabilities[outcomeIndex] / 100).toFixed(2)
    const formattedPayout = formatBigNumber(mulBN(shares, payout), collateral.decimals)
    const formattedShares = formatBigNumber(shares, collateral.decimals)
    const isWinningOutcome = payouts && payouts[outcomeIndex] > 0

    return (
      <TR key={`${outcomeName}-${outcomeIndex}`}>
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
        {disabledColumns.includes(OutcomeTableValue.OutcomeProbability) ? null : (
          <TDStyled textAlign={TableCellsAlign[1]}>
            <BarDiagram
              outcomeIndex={outcomeIndex}
              outcomeName={isWinningOutcome ? '' : outcomeName}
              probability={probability}
              selected={outcomeSelected === outcomeIndex}
              winningBadge={
                isWinningOutcome && (
                  <WinningBadgeStyled index={outcomeIndex} outcomeName={outcomeName} payouts={payouts} />
                )
              }
            />
            {!isWinningOutcome && <OwnedShares outcomeIndex={outcomeIndex} value={formattedShares} />}
            <RedeemAmount balance={balanceItem} collateral={collateral} index={outcomeIndex} payouts={payouts} />
          </TDStyled>
        )}
        {disabledColumns.includes(OutcomeTableValue.Outcome) ? null : (
          <TDStyled textAlign={TableCellsAlign[4]}>
            <OutcomeItemTextWrapper>
              {<OutcomeItemLittleBallOfJoyAndDifferentColors outcomeIndex={outcomeIndex} />}
              <OutcomeItemText>{outcomeName}</OutcomeItemText>
            </OutcomeItemTextWrapper>
          </TDStyled>
        )}
        {disabledColumns.includes(OutcomeTableValue.Probability) ? null : (
          <TDStyled textAlign={TableCellsAlign[5]}>{probability.toFixed(2)}%</TDStyled>
        )}
        {disabledColumns.includes(OutcomeTableValue.CurrentPrice) ? null : (
          <TDStyled textAlign={TableCellsAlign[2]}>
            <TDFlexDiv textAlign={TableCellsAlign[2]}>
              {currentPriceFormatted} {showPriceChange && <NewValue outcomeIndex={outcomeIndex} value={newPrice} />}
            </TDFlexDiv>
          </TDStyled>
        )}
        {disabledColumns.includes(OutcomeTableValue.Shares) ? null : (
          <TDStyled textAlign={TableCellsAlign[3]}>{formattedShares}</TDStyled>
        )}
        {disabledColumns.includes(OutcomeTableValue.Payout) ? null : (
          <TDStyled textAlign={TableCellsAlign[4]}>{withWinningOutcome && payouts ? formattedPayout : '0.00'}</TDStyled>
        )}
      </TR>
    )
  }

  const renderTable = () => balances.map((balanceItem: BalanceItem, index) => renderTableRow(balanceItem, index))

  return (
    <TableWrapper>
      <Table head={renderTableHeader()}>{renderTable()}</Table>
    </TableWrapper>
  )
}
