import React from 'react'

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

  console.log(shortSharesFormatted)
  console.log(longSharesFormatted)

  return <p>hello</p>
}
