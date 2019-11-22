import React from 'react'

import { MarketView } from './market_view'
import { useConnectedWeb3Context } from '../../hooks/connectedWeb3'
import { useContracts } from '../../hooks/useContracts'
import { FullLoading } from '../common/full_loading'
import { useMarketMakerData } from '../../hooks/useMarketMakerData'

interface Props {
  marketMakerAddress: string
}

const MarketViewContainer: React.FC<Props> = (props: Props) => {
  const context = useConnectedWeb3Context()

  const { oracle } = useContracts(context)

  const { marketMakerAddress } = props

  const { marketMakerData, status } = useMarketMakerData(marketMakerAddress, context)

  const {
    marketMakerFunding,
    balance,
    winnerOutcome,
    collateral,
    question,
    resolution,
    arbitrator,
    category,
    isQuestionFinalized,
    questionId,
  } = marketMakerData

  const resolveCondition = async () => {
    return oracle.resolveCondition(questionId)
  }

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
      isQuestionFinalized={isQuestionFinalized}
      onResolveCondition={resolveCondition}
    />
  )
}

export { MarketViewContainer }
