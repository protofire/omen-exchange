import { BigNumber, parseUnits } from 'ethers/utils'
import React, { useEffect, useMemo, useState } from 'react'
import styled, { css } from 'styled-components'

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
}

export const PositionTable = (props: Props) => {
  const { balances, collateral, currentPrediction, fee, trades } = props

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

  useEffect(() => {
    let totalShortCollateralAmount
    let totalLongCollateralAmount

    if (shortTrades.length) {
      const shortCollateralAmounts = shortTrades.map(trade => trade.collateralAmount)
      totalShortCollateralAmount = shortCollateralAmounts.reduce((a, b) => a.add(b))
    }

    if (longTrades.length) {
      const longCollateralAmounts = longTrades.map(trade => trade.collateralAmount)
      totalLongCollateralAmount = longCollateralAmounts.reduce((a, b) => a.add(b))
    }

    totalShortCollateralAmount && setTotalShortCollateralAmount(totalShortCollateralAmount)
    totalLongCollateralAmount && setTotalLongCollateralAmount(totalLongCollateralAmount)
  }, [longTrades, shortTrades])

  // useEffect(() => {
  //   const virtualHoldings = [
  //     new BigNumber(parseUnits(String(20 * Number(currentPrediction)), 18)),
  //     new BigNumber(parseUnits(String(20 * (1 - Number(currentPrediction))), 18)),
  //   ]
  //   setVirtualHoldings(virtualHoldings)
  // }, [currentPrediction])

  // const calcShortPayoutAmount = useMemo(
  //   () => async (amountShares: BigNumber): Promise<Maybe<BigNumber>> => {
  //     const payoutAmount = calcSellAmountInCollateral(amountShares, virtualHoldings[0], [virtualHoldings[1]], marketFee)

  //     return payoutAmount
  //   },
  //   [virtualHoldings, marketFee],
  // )

  // const calcLongPayoutAmount = useMemo(
  //   () => async (amountShares: BigNumber): Promise<Maybe<BigNumber>> => {
  //     const payoutAmount = calcSellAmountInCollateral(amountShares, virtualHoldings[1], [virtualHoldings[0]], marketFee)

  //     return payoutAmount
  //   },
  //   [virtualHoldings, marketFee],
  // )

  // const shortPayoutAmount = useAsyncDerivedValue(shortShares, new BigNumber(0), calcShortPayoutAmount)
  // const longPayoutAmount = useAsyncDerivedValue(longShares, new BigNumber(0), calcLongPayoutAmount)
  // const shortPayoutAmountNumber = Number(formatBigNumber(shortPayoutAmount || new BigNumber(0), collateral.decimals))
  // const longPayoutAmountNumber = Number(formatBigNumber(longPayoutAmount || new BigNumber(0), collateral.decimals))

  // useEffect(() => {
  //   setShortProfitPercentage(
  //     (shortPayoutAmountNumber / Number(formatBigNumber(totalShortCollateralAmount, collateral.decimals)) - 1) * 100,
  //   )
  //   setLongProfitPercentage(
  //     (longPayoutAmountNumber / Number(formatBigNumber(totalLongCollateralAmount, collateral.decimals)) - 1) * 100,
  //   )
  //   setShortProfitAmount(
  //     (shortProfitPercentage * Number(formatBigNumber(totalShortCollateralAmount, collateral.decimals))) / 100,
  //   )
  //   setLongProfitAmount(
  //     (longProfitPercentage * Number(formatBigNumber(totalLongCollateralAmount, collateral.decimals))) / 100,
  //   )
  // }, [
  //   shortPayoutAmountNumber,
  //   totalShortCollateralAmount,
  //   collateral.decimals,
  //   longPayoutAmountNumber,
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

  // const dust = parseUnits('0.00001', collateral.decimals)
  // if (shortPayoutAmount?.lte(dust) && longPayoutAmount?.lte(dust)) {
  //   return <></>
  // }

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
    // if ((index === 0 && !shortTrades.length) || (index === 0 && shortPayoutAmount?.lte(dust))) return
    // if ((index === 1 && !longTrades.length) || (index === 1 && longPayoutAmount?.lte(dust))) return
    return (
      <TR key={index}>
        <TDPosition textAlign={TableCellsAlign[0]}>{index === 0 ? 'Short' : 'Long'}</TDPosition>
        <TDStyled textAlign={TableCellsAlign[1]}>{index === 0 ? shortSharesFormatted : longSharesFormatted}</TDStyled>
        <TDStyled textAlign={TableCellsAlign[2]}>
          {/* {index === 0
            ? formatNumber(formatBigNumber(shortPayoutAmount || new BigNumber(0), collateral.decimals))
            : formatNumber(formatBigNumber(longPayoutAmount || new BigNumber(0), collateral.decimals))} */}
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
