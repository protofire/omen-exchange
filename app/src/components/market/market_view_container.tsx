import React, { FC, useState } from 'react'

import { MarketView } from './market_view'
import { useConnectedWeb3Context } from '../../hooks/connectedWeb3'
import { FullLoading } from '../common/full_loading'
import { StepProfile } from '../../util/types'
import { useQuestion } from '../../hooks/useQuestion'
import { useMarketMakerData } from '../../hooks/useMarketMakerData'

interface Props {
  marketMakerAddress: string
}

const MarketViewContainer: FC<Props> = props => {
  const context = useConnectedWeb3Context()

  const { marketMakerAddress } = props
  const [stepProfile, setStepProfile] = useState<StepProfile>(StepProfile.View)

  const { question, resolution } = useQuestion(marketMakerAddress, context)
  const { marketMakerFunding, balance, winnerOutcome, status, collateral } = useMarketMakerData(
    marketMakerAddress,
    context,
  )

  if (winnerOutcome) {
    setStepProfile(StepProfile.CloseMarketDetail)
  }

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
      stepProfile={stepProfile}
      winnerOutcome={winnerOutcome}
      collateral={collateral}
    />
  )
}

export { MarketViewContainer }
