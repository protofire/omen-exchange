import React, { FC, useState } from 'react'

import { MarketFund } from './market_fund'
import { useConnectedWeb3Context } from '../../hooks/connectedWeb3'
import { useQuestion } from '../../hooks/useQuestion'
import { useMarketMakerData } from '../../hooks/useMarketMakerData'
import { FullLoading } from '../common/full_loading'

interface Props {
  marketMakerAddress: string
}

const MarketFundContainer: FC<Props> = props => {
  const context = useConnectedWeb3Context()
  const [marketMakerAddress] = useState<string>(props.marketMakerAddress)

  const { question, resolution } = useQuestion(marketMakerAddress, context)
  const {
    totalPoolShares,
    userPoolShares,
    userPoolSharesPercentage,
    balance,
    winnerOutcome,
    marketMakerFunding,
    marketMakerUserFunding,
    marketMakerFundingPercentage,
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
      userPoolSharesPercentage={userPoolSharesPercentage}
      marketMakerFunding={marketMakerFunding}
      marketMakerUserFunding={marketMakerUserFunding}
      marketMakerFundingPercentage={marketMakerFundingPercentage}
      balance={balance}
      winnerOutcome={winnerOutcome}
      collateral={collateral}
    />
  )
}

export { MarketFundContainer }
