import React, { useEffect, useState } from 'react'

import { formatBigNumber, formatNumber } from '../../../../util/tools'
import { BalanceItem, TradeObject } from '../../../../util/types'

interface Props {
  trades: TradeObject[]
  balances: BalanceItem[]
}

export const PositionTable = (props: Props) => {
  const { balances, trades } = props

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

  console.log(averageShortPrediction)
  console.log(averageLongPrediction)

  return <p>hello</p>
}
