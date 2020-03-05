import React from 'react'

import { useConnectedWeb3Context } from '../../hooks/connectedWeb3'
import { useMarketMakerData } from '../../hooks/useMarketMakerData'
import { Loading } from '../common'

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
  } = marketMakerData

  if (!collateral) {
    return <Loading full={true} />
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
    />
  )
}

export { MarketViewContainer }
