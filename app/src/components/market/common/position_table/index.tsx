import React, { useEffect, useState } from 'react'
import styled, { css } from 'styled-components'

import { formatBigNumber, formatNumber } from '../../../../util/tools'
import { BalanceItem, PositionTableValue, Token, TradeObject } from '../../../../util/types'
import { RadioInput, TD, TH, THead, TR, Table } from '../../../common'

const TableWrapper = styled.div`
  margin-left: -24px
  margin-right: -24px
`

const PaddingCSS = css`
  padding-left: 25px;
  padding-right: 0;

  &:last-child {
    padding-right: 25px;
  }
`

const THStyled = styled(TH as any)`
  ${PaddingCSS}
`

interface Props {
  trades: TradeObject[]
  balances: BalanceItem[]
  collateral: Token
}

export const PositionTable = (props: Props) => {
  const { balances, collateral, trades } = props

  const shortTrades = trades.filter(trade => trade.outcomeIndex === '0')
  const longTrades = trades.filter(trade => trade.outcomeIndex === '1')

  const shortShares = balances[0].shares
  const longShares = balances[1].shares
  const shortSharesFormatted = formatNumber(formatBigNumber(shortShares, 18))
  const longSharesFormatted = formatNumber(formatBigNumber(longShares, 18))

  const [averageShortPrediction, setAverageShortPrediction] = useState<number>(0)
  const [averageLongPrediction, setAverageLongPrediction] = useState<number>(0)

  useEffect(() => {
    const averagePrediction = (trades: TradeObject[]) => {
      const individualAverages = trades.map(trade => {
        return (Number(trade.outcomeTokenMarginalPrice) + Number(trade.oldOutcomeTokenMarginalPrice)) / 2
      })
      const collateralAmounts = trades.map(trade => Number(trade.collateralAmount))
      const totalCollateralAmount = collateralAmounts.reduce((a, b) => a + b)
      const collateralWeights = collateralAmounts.map(collateralAmount => collateralAmount / totalCollateralAmount)
      const tradeSums = individualAverages.map((individualAverage, i) => individualAverage * collateralWeights[i])
      const averagePrediction = tradeSums.reduce((a, b) => a + b)
      return averagePrediction
    }

    setAverageShortPrediction(1 - averagePrediction(shortTrades))
    setAverageLongPrediction(averagePrediction(longTrades))
  }, [shortTrades, longTrades])

  const TableHead: PositionTableValue[] = [
    PositionTableValue.YourPosition,
    PositionTableValue.Shares,
    PositionTableValue.Payout,
    PositionTableValue.ProfitLoss,
  ]

  const TableCellsAlign = ['left', 'right', 'right', 'right']

  const renderTableHeader = () => {
    return (
      <THead>
        <TR>
          {TableHead.map((value, index) => {
            return (
              <THStyled key={index} textAlign={TableCellsAlign[index]}>
                {value} {value === PositionTableValue.Payout && `(${collateral.symbol})`}
              </THStyled>
            )
          })}
        </TR>
      </THead>
    )
  }

  // const renderTableRow = (index: number) => {}

  return (
    <TableWrapper>
      <Table head={renderTableHeader()}>
        <p>hello</p>
      </Table>
    </TableWrapper>
  )
}
