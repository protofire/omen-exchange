import React from 'react'

import { MarketView } from './market_view'
import { useConnectedWeb3Context } from '../../hooks/connectedWeb3'
import { FullLoading } from '../common/full_loading'
import { useQuestion } from '../../hooks/useQuestion'
import { useMarketMakerData } from '../../hooks/useMarketMakerData'

interface Props {
  marketMakerAddress: string
}

const MarketViewContainer = (props: Props) => {
  const context = useConnectedWeb3Context()

  const { marketMakerAddress } = props

  const { question, resolution } = useQuestion(marketMakerAddress, context)
  const { marketMakerFunding, balance, winnerOutcome, status, collateral } = useMarketMakerData(
    marketMakerAddress,
    context,
  )

  if (!collateral) {
    return <FullLoading />
  }

  return (
    <MarketView
      balance={balance}
      funding={marketMakerFunding}
      marketMakerAddress={marketMakerAddress}
      question={question || ''}
      resolution={resolution}
      status={status}
      winnerOutcome={winnerOutcome}
      collateral={collateral}
    />
  )
}

export { MarketViewContainer }
