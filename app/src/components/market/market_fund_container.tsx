import React from 'react'

import { MarketFund } from './market_fund'
import { useConnectedWeb3Context } from '../../hooks/connectedWeb3'
import { useQuestion } from '../../hooks/useQuestion'
import { useMarketMakerData } from '../../hooks/useMarketMakerData'
import { FullLoading } from '../common/full_loading'

interface Props {
  marketMakerAddress: string
}

const MarketFundContainer = (props: Props) => {
  const context = useConnectedWeb3Context()

  const { marketMakerAddress } = props
  const { question, resolution } = useQuestion(marketMakerAddress, context)
  const {
    totalPoolShares,
    userPoolShares,
    balance,
    winnerOutcome,
    marketMakerFunding,
    marketMakerUserFunding,
    collateral,
  } = useMarketMakerData(marketMakerAddress, context)

  if (!collateral) {
    return <FullLoading />
  }

  return (
    <MarketFund
      marketMakerAddress={marketMakerAddress}
      question={question || ''}
      resolution={resolution}
      totalPoolShares={totalPoolShares}
      userPoolShares={userPoolShares}
      marketMakerFunding={marketMakerFunding}
      marketMakerUserFunding={marketMakerUserFunding}
      balance={balance}
      winnerOutcome={winnerOutcome}
      collateral={collateral}
    />
  )
}

export { MarketFundContainer }
