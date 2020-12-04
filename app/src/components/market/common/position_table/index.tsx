import { BigNumber } from 'ethers/utils'
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

const TDStyled = styled(TD as any)`
  ${PaddingCSS}
`

const TDPosition = styled(TD as any)`
  ${PaddingCSS}
  font-weight: 400;
`

interface Props {
  trades: TradeObject[]
  balances: BalanceItem[]
  collateral: Token
  currentPrediction: string
}

export const PositionTable = (props: Props) => {
  const { balances, collateral, currentPrediction, trades } = props

  const shortShares = balances[0].shares
  const longShares = balances[1].shares
  const shortSharesNumber = Number(formatBigNumber(shortShares, 18))
  const longSharesNumber = Number(formatBigNumber(longShares, 18))
  const shortSharesFormatted = formatNumber(formatBigNumber(shortShares, 18))
  const longSharesFormatted = formatNumber(formatBigNumber(longShares, 18))

  const [shortTrades, setShortTrades] = useState<TradeObject[]>(trades.filter(trade => trade.outcomeIndex === '0'))
  const [longTrades, setlongTrades] = useState<TradeObject[]>(trades.filter(trade => trade.outcomeIndex === '1'))
  const [averageShortPrediction, setAverageShortPrediction] = useState<number>(0)
  const [averageLongPrediction, setAverageLongPrediction] = useState<number>(0)
  const [shortProfitPercentage, setShortProfitPercentage] = useState<number>(0)
  const [longProfitPercentage, setLongProfitPercentage] = useState<number>(0)
  const [totalShortCollateralAmount, setTotalShortCollateralAmount] = useState<BigNumber>(new BigNumber(0))
  const [totalLongCollateralAmount, setTotalLongCollateralAmount] = useState<BigNumber>(new BigNumber(0))
  const [shortProfitAmount, setShortProfitAmount] = useState<number>(0)
  const [longProfitAmount, setLongProfitAmount] = useState<number>(0)
  const [shortPayoutAmount, setShortPayoutAmount] = useState<number>(0)
  const [longPayoutAmount, setLongPayoutAmount] = useState<number>(0)

  console.log(balances)

  const calcPositionData = (trades: TradeObject[]): { averagePrediction: number; totalCollateralAmount: BigNumber } => {
    if (!trades.length) return { averagePrediction: 0, totalCollateralAmount: new BigNumber(0) }
    const tradePrices = trades.map(trade => {
      return Number(trade.outcomeTokenMarginalPrice)
    })
    const collateralAmounts = trades.map(trade => trade.collateralAmount)
    const totalCollateralAmount = collateralAmounts.reduce((a, b) => a.add(b))
    const collateralWeights = collateralAmounts.map(collateralAmount => collateralAmount.div(totalCollateralAmount))
    const tradeSums = tradePrices.map((trade, i) => trade * collateralWeights[i].toNumber())
    const averagePrediction = tradeSums.reduce((a, b) => a + b)
    return { averagePrediction, totalCollateralAmount }
  }

  useEffect(() => {
    const {
      averagePrediction: averageShortPrediction,
      totalCollateralAmount: totalShortCollateralAmount,
    } = calcPositionData(shortTrades)
    const {
      averagePrediction: averageLongPrediction,
      totalCollateralAmount: totalLongCollateralAmount,
    } = calcPositionData(longTrades)

    setAverageShortPrediction(1 - averageShortPrediction)
    setAverageLongPrediction(averageLongPrediction)
    setTotalShortCollateralAmount(totalShortCollateralAmount)
    setTotalLongCollateralAmount(totalLongCollateralAmount)
  }, [longTrades, shortTrades])

  useEffect(() => {
    setShortPayoutAmount(shortSharesNumber * (1 - Number(currentPrediction)))
    setLongPayoutAmount(longSharesNumber * Number(currentPrediction))
  }, [shortSharesNumber, currentPrediction, longSharesNumber])

  // useEffect(() => {
  //   setShortProfitPercentage(averageShortPrediction - Number(currentPrediction) * 100)
  //   setLongProfitPercentage((Number(currentPrediction) - averageLongPrediction) * 100)
  //   setShortProfitAmount(
  //     (shortProfitPercentage * Number(formatBigNumber(totalShortCollateralAmount, collateral.decimals))) / 100,
  //   )
  //   setLongProfitAmount(
  //     (longProfitPercentage * Number(formatBigNumber(totalLongCollateralAmount, collateral.decimals))) / 100,
  //   )
  //   setShortPayoutAmount(Number(formatBigNumber(totalShortCollateralAmount, collateral.decimals)) + shortProfitAmount)
  //   setLongPayoutAmount(Number(formatBigNumber(totalLongCollateralAmount, collateral.decimals)) + longProfitAmount)
  // }, [
  //   averageShortPrediction,
  //   averageLongPrediction,
  //   currentPrediction,
  //   collateral.decimals,
  //   longProfitPercentage,
  //   shortProfitPercentage,
  //   totalLongCollateralAmount,
  //   totalShortCollateralAmount,
  //   longProfitAmount,
  //   shortProfitAmount,
  // ])

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

  const renderTableRow = (index: number) => {
    if (index === 0 && !shortTrades.length) return
    if (index === 1 && !longTrades.length) return
    return (
      <TR>
        <TDPosition textAlign={TableCellsAlign[0]}>{index === 0 ? 'Short' : 'Long'}</TDPosition>
        <TDStyled textAlign={TableCellsAlign[1]}>{index === 0 ? shortSharesFormatted : longSharesFormatted}</TDStyled>
        <TDStyled textAlign={TableCellsAlign[2]}>
          {index === 0 ? formatNumber(shortPayoutAmount.toString()) : formatNumber(longPayoutAmount.toString())}
        </TDStyled>
        <TDStyled textAlign={TableCellsAlign[3]}>
          {index === 0 ? formatNumber(shortProfitAmount.toString()) : formatNumber(longProfitAmount.toString())}(
          {index === 0 ? formatNumber(shortProfitPercentage.toString()) : formatNumber(longProfitPercentage.toString())}
          %)
        </TDStyled>
      </TR>
    )
  }

  const renderTable = () => {
    return [0, 1].map(index => renderTableRow(index))
  }

  return (
    <TableWrapper>
      <Table head={renderTableHeader()}>{renderTable()}</Table>
    </TableWrapper>
  )
}
