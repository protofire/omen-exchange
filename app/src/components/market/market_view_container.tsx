import React, { FC, useState } from 'react'

import { MarketView } from './market_view'
import { useConnectedWeb3Context } from '../../hooks/connectedWeb3'
import { StepProfile } from '../../util/types'
import { useQuestion } from '../../hooks/useQuestion'
import { useMarketMakerData } from '../../hooks/useMarketMakerData'

interface Props {
  marketMakerAddress: string
}

const MarketViewContainer: FC<Props> = props => {
  const context = useConnectedWeb3Context()

  const [marketMakerAddress] = useState<string>(props.marketMakerAddress)
  const [stepProfile, setStepProfile] = useState<StepProfile>(StepProfile.View)

  const { question, resolution } = useQuestion(marketMakerAddress, context)
  const { marketFunding, balance, winnerOutcome, status } = useMarketMakerData(
    marketMakerAddress,
    context,
  )

  if (winnerOutcome) {
    setStepProfile(StepProfile.CloseMarketDetail)
  }

  return (
    <MarketView
      balance={balance}
      funding={marketFunding}
      marketMakerAddress={marketMakerAddress}
      question={question || ''}
      resolution={resolution}
      status={status}
      stepProfile={stepProfile}
      winnerOutcome={winnerOutcome}
    />
  )
}

export { MarketViewContainer }
