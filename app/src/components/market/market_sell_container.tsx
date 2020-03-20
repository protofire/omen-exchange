import React from 'react'

import { useMarketMakerData, useQuestion } from '../../hooks'
import { useConnectedWeb3Context } from '../../hooks/connectedWeb3'
import { FullLoading } from '../loading'

import { MarketSell } from './market_sell'

interface Props {
  marketMakerAddress: string
}

const MarketSellContainer: React.FC<Props> = (props: Props) => {
  const context = useConnectedWeb3Context()

  const { marketMakerAddress } = props
  const { question, resolution } = useQuestion(marketMakerAddress, context)
  const { marketMakerData } = useMarketMakerData(marketMakerAddress, context)
  const { balances, collateral } = marketMakerData

  if (!collateral || balances.length === 0) {
    return <FullLoading />
  }

  return (
    <MarketSell
      balances={balances}
      collateral={collateral}
      marketMakerAddress={marketMakerAddress}
      question={question}
      resolution={resolution}
    />
  )
}

export { MarketSellContainer }
