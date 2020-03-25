import React from 'react'

import { useMarketMakerData } from '../../hooks'
import { useConnectedWeb3Context } from '../../hooks/connectedWeb3'
import { FullLoading } from '../loading'

import { MarketView } from './market_view'

interface Props {
  marketMakerAddress: string
}

const MarketViewContainer: React.FC<Props> = (props: Props) => {
  const context = useConnectedWeb3Context()

  const { marketMakerAddress } = props

  const { marketMakerData, status } = useMarketMakerData(marketMakerAddress, context)

  const {
    arbitrator,
    balances,
    category,
    collateral,
    isConditionResolved,
    isQuestionFinalized,
    marketMakerFunding,
    question,
    questionId,
    resolution,
    totalPoolShares,
    userPoolShares,
  } = marketMakerData

  if (!collateral) {
    return <FullLoading />
  }

  return (
    <MarketView
      account={context.account}
      arbitrator={arbitrator}
      balances={balances}
      category={category || ''}
      collateral={collateral}
      funding={marketMakerFunding}
      isConditionResolved={isConditionResolved}
      isQuestionFinalized={isQuestionFinalized}
      marketMakerAddress={marketMakerAddress}
      question={question || ''}
      questionId={questionId}
      resolution={resolution}
      status={status}
      totalPoolShares={totalPoolShares}
      userPoolShares={userPoolShares}
    />
  )
}

export { MarketViewContainer }
