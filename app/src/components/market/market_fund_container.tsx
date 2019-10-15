import React, { FC, useState } from 'react'

import { MarketFund } from './market_fund'
import { useConnectedWeb3Context } from '../../hooks/connectedWeb3'
import { useQuestion } from '../../hooks/useQuestion'
import { useMarketMakerData } from '../../hooks/useMarketMakerData'

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
    status,
    marketMakerFunding,
    marketMakerUserFunding,
    marketMakerFundingPercentage,
  } = useMarketMakerData(marketMakerAddress, context)

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
      status={status}
    />
  )
}

export { MarketFundContainer }
