import { BigNumber, parseUnits } from 'ethers/utils'
import React, { useEffect, useMemo, useState } from 'react'
import styled, { css } from 'styled-components'

import { DUST } from '../../../../common/constants'
import { useAsyncDerivedValue } from '../../../../hooks'
import { calcSellAmountInCollateral, formatBigNumber, formatNumber } from '../../../../util/tools'
import { BalanceItem, PositionTableValue, Token, TradeObject } from '../../../../util/types'
import { TD, TH, THead, TR, Table } from '../../../common'

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
  fee: BigNumber | null | undefined
  longPayout: number
  shortPayout: number
  shortProfitLoss: number
  longProfitLoss: number
  shortProfitLossPercentage: number
  longProfitLossPercentage: number
}

export const PositionTable = (props: Props) => {
  const {
    balances,
    collateral,
    currentPrediction,
    fee,
    longPayout,
    longProfitLoss,
    longProfitLossPercentage,
    shortPayout,
    shortProfitLoss,
    shortProfitLossPercentage,
    trades,
  } = props

  const shortShares = balances[0].shares
  const longShares = balances[1].shares
  const shortSharesFormatted = formatNumber(formatBigNumber(shortShares, 18))
  const longSharesFormatted = formatNumber(formatBigNumber(longShares, 18))

  const holdings = balances.map(balance => balance.holdings)

  const [shortTrades] = useState<TradeObject[]>(trades.filter(trade => trade.outcomeIndex === '0'))
  const [longTrades] = useState<TradeObject[]>(trades.filter(trade => trade.outcomeIndex === '1'))
  const [marketFee] = useState<number>(Number(formatBigNumber(fee || new BigNumber(0), 18)))
  const [shortProfitPercentage, setShortProfitPercentage] = useState<number>(0)
  const [longProfitPercentage, setLongProfitPercentage] = useState<number>(0)
  const [totalShortCollateralAmount, setTotalShortCollateralAmount] = useState<BigNumber>(new BigNumber(0))
  const [totalLongCollateralAmount, setTotalLongCollateralAmount] = useState<BigNumber>(new BigNumber(0))
  const [shortProfitAmount, setShortProfitAmount] = useState<number>(0)
  const [longProfitAmount, setLongProfitAmount] = useState<number>(0)
  const [virtualHoldings, setVirtualHoldings] = useState<BigNumber[]>(holdings)

  // useEffect(() => {
  //   let totalShortCollateralAmount
  //   let totalLongCollateralAmount

  //   if (shortTrades.length) {
  //     const shortCollateralAmounts = shortTrades.map(trade => trade.collateralAmount)
  //     totalShortCollateralAmount = shortCollateralAmounts.reduce((a, b) => a.add(b))
  //   }

  //   if (longTrades.length) {
  //     const longCollateralAmounts = longTrades.map(trade => trade.collateralAmount)
  //     totalLongCollateralAmount = longCollateralAmounts.reduce((a, b) => a.add(b))
  //   }

  //   totalShortCollateralAmount && setTotalShortCollateralAmount(totalShortCollateralAmount)
  //   totalLongCollateralAmount && setTotalLongCollateralAmount(totalLongCollateralAmount)
  // }, [longTrades, shortTrades])

  // useEffect(() => {
  //   setShortProfitPercentage(
  //     (shortPayout / Number(formatBigNumber(totalShortCollateralAmount, collateral.decimals)) - 1) * 100,
  //   )
  //   setLongProfitPercentage(
  //     (longPayout / Number(formatBigNumber(totalLongCollateralAmount, collateral.decimals)) - 1) * 100,
  //   )
  // }, [
  //   shortPayout,
  //   totalShortCollateralAmount,
  //   collateral.decimals,
  //   longPayout,
  //   totalLongCollateralAmount,
  //   shortProfitPercentage,
  //   longProfitPercentage,
  // ])

  const TableHead: PositionTableValue[] = [
    PositionTableValue.YourPosition,
    PositionTableValue.Shares,
    PositionTableValue.Payout,
    PositionTableValue.ProfitLoss,
  ]

  const TableCellsAlign = ['left', 'right', 'right', 'right']

  if (shortShares.lte(DUST) && longShares.lte(DUST)) {
    return <></>
  }

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
    if ((index === 0 && !shortTrades.length) || (index === 0 && shortShares.lte(DUST))) return
    if ((index === 1 && !longTrades.length) || (index === 1 && longShares.lte(DUST))) return
    return (
      <TR key={index}>
        <TDPosition textAlign={TableCellsAlign[0]}>{index === 0 ? 'Short' : 'Long'}</TDPosition>
        <TDStyled textAlign={TableCellsAlign[1]}>{index === 0 ? shortSharesFormatted : longSharesFormatted}</TDStyled>
        <TDStyled textAlign={TableCellsAlign[2]}>
          {index === 0 ? formatNumber(shortPayout.toString()) : formatNumber(longPayout.toString())}
        </TDStyled>
        <TDStyled textAlign={TableCellsAlign[3]}>
          {index === 0 ? formatNumber(shortProfitLoss.toString()) : formatNumber(longProfitLoss.toString())}(
          {index === 0
            ? formatNumber(shortProfitLossPercentage.toString())
            : formatNumber(longProfitLossPercentage.toString())}
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
