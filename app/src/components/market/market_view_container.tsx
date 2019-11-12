import React from 'react'

import { MarketView } from './market_view'
import { useConnectedWeb3Context } from '../../hooks/connectedWeb3'
import { FullLoading } from '../common/full_loading'
import { useMarketMakerData } from '../../hooks/useMarketMakerData'

interface Props {
  marketMakerAddress: string
}

const MarketViewContainer: React.FC<Props> = (props: Props) => {
  const context = useConnectedWeb3Context()

  const { marketMakerAddress } = props

  const {
    marketMakerFunding,
    balance,
    winnerOutcome,
    status,
    collateral,
    question,
    resolution,
    arbitrator,
    category,
  } = useMarketMakerData(marketMakerAddress, context)

  if (!collateral) {
    return <FullLoading />
  }

  return (
    <MarketView
      balance={balance}
      funding={marketMakerFunding}
      marketMakerAddress={marketMakerAddress}
      status={status}
      winnerOutcome={winnerOutcome}
      collateral={collateral}
      question={question || ''}
      category={category || ''}
      resolution={resolution}
      arbitrator={arbitrator}
    />
  )
}

export { MarketViewContainer }
