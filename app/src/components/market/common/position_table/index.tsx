import React from 'react'

import { TradeObject } from '../../../../util/types'

interface Props {
  trades: TradeObject[]
}

export const PositionTable = (props: Props) => {
  const { trades } = props
  console.log(trades)

  const shortTrades = trades.filter(trade => trade.outcomeIndex === '0')
  const longTrades = trades.filter(trade => trade.outcomeIndex === '1')

  console.log(shortTrades, longTrades)

  return <p>hello</p>
}
