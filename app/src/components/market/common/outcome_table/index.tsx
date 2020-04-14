import Big from 'big.js'
import { BigNumber } from 'ethers/utils'
import React from 'react'
import styled, { css } from 'styled-components'

import { IS_CORONA_VERSION } from '../../../../common/constants'
import { formatBigNumber, mulBN } from '../../../../util/tools'
import { BalanceItem, OutcomeTableValue, Token } from '../../../../util/types'
import { RadioInput, TD, TH, THead, TR, Table } from '../../../common'
import { DragonBallIcon } from '../../../common/icons'
import { BarDiagram } from '../bar_diagram_probabilities'
import { OutcomeItemLittleBallOfJoyAndDifferentColors, OutcomeItemText, OutcomeItemTextWrapper } from '../common_styled'
import { NewValue } from '../new_value'
import { OwnedShares } from '../owned_shares'

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

const BadgeWrapper = styled.div<{ outcomeIndex: number }>`
  align-items: center;
  display: flex;
  margin: 0 0 0 12px;

  .dragonBallIcon {
    margin: 0 8px 0 0;
  }

  .fill {
    fill: ${props =>
      props.theme.outcomes.colors[props.outcomeIndex].darker
        ? props.theme.outcomes.colors[props.outcomeIndex].darker
        : '#333'};
  }
`

const BadgeText = styled.div<{ outcomeIndex: number }>`
  color: ${props =>
    props.theme.outcomes.colors[props.outcomeIndex].darker
      ? props.theme.outcomes.colors[props.outcomeIndex].darker
      : '#333'};
  font-size: 14px;
  font-weight: 500;
  line-height: 1.2;
`

const RedeemText = styled.div<{ outcomeIndex: number }>`
  color: ${props =>
    props.theme.outcomes.colors[props.outcomeIndex].darker
      ? props.theme.outcomes.colors[props.outcomeIndex].darker
      : '#333'};
  font-size: 14px;
  font-weight: 500;
  line-height: 1.2;
  margin: 12px 0 0 0;
  text-align: left;
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
  } = props

  const WinningOutcome = (props: any) => {
    const { index } = props

    return (
      payouts && (
        <BadgeWrapper outcomeIndex={index}>
          <DragonBallIcon />
          <BadgeText outcomeIndex={index}>
            {payouts[index] < 1 ? `${payouts[index] * 100}% ` : ''} Winning Outcome
          </BadgeText>
        </BadgeWrapper>
      )
    )
  }

  const RedeemAmount = (props: any) => {
    const { balance, index } = props
    const shares = new Big(balance.shares.toString())

    if (!payouts || shares.eq(0)) return null

    const redeemable = new BigNumber(shares.mul(payouts[index]).toString())

    return (
      <RedeemText outcomeIndex={index}>{`Redeem ${formatBigNumber(
        redeemable,
        collateral.decimals,
      )} (${shares} Shares)`}</RedeemText>
    )
  }

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
    const currentPriceFormatted = Number(currentPrice).toFixed(2)
    const probability = probabilities[outcomeIndex]
    const isOutcomeSelected = outcomeSelected === outcomeIndex
    const showSharesAndPriceChange = isOutcomeSelected && !IS_CORONA_VERSION
    const formattedPayout = formatBigNumber(mulBN(shares, payout), collateral.decimals)
    const isWinningOutcome = payouts && payouts[outcomeIndex] > 0

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
        {disabledColumns.includes(OutcomeTableValue.OutcomeProbability) ? null : withWinningOutcome ? (
          <TDStyled textAlign={TableCellsAlign[1]}>
            <BarDiagram outcomeIndex={outcomeIndex} outcomeName={outcomeName} probability={probability} />
            {showSharesAndPriceChange && <OwnedShares outcomeIndex={outcomeIndex} value="250.55" />}
          </TDStyled>
        ) : (
          <TDStyled textAlign={TableCellsAlign[1]}>
            <BarDiagram outcomeIndex={outcomeIndex} outcomeName={outcomeName} probability={probability} />
            {showSharesAndPriceChange && <OwnedShares outcomeIndex={outcomeIndex} value="250.55" />}
          </TDStyled>
        )}
        {disabledColumns.includes(OutcomeTableValue.Outcome) ? null : (
          <TDStyled textAlign={TableCellsAlign[4]}>
            <OutcomeItemTextWrapper>
              {<OutcomeItemLittleBallOfJoyAndDifferentColors outcomeIndex={outcomeIndex} />}
              <OutcomeItemText>{outcomeName}</OutcomeItemText>
              {isWinningOutcome && <WinningOutcome balance={balanceItem} index={outcomeIndex} />}
            </OutcomeItemTextWrapper>
            {isWinningOutcome && <RedeemAmount balance={balanceItem} index={outcomeIndex} />}
          </TDStyled>
        )}
        {disabledColumns.includes(OutcomeTableValue.Probability) ? null : (
          <TDStyled textAlign={TableCellsAlign[5]}>{probability.toFixed(2)}%</TDStyled>
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
        {disabledColumns.includes(OutcomeTableValue.Payout) ? null : withWinningOutcome && payouts ? (
          <TDStyled textAlign={TableCellsAlign[4]}>{formattedPayout}</TDStyled>
        ) : (
          <TDStyled textAlign={TableCellsAlign[4]}>0.00</TDStyled>
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
