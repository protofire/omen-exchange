import React from 'react'

import { MarketFund } from './market_fund'
import { useConnectedWeb3Context } from '../../hooks/connectedWeb3'
import { useQuestion } from '../../hooks/useQuestion'
import { useMarketMakerData } from '../../hooks/useMarketMakerData'
import { FullLoading } from '../common/full_loading'

interface Props {
  marketMakerAddress: string
}

const MarketFundContainer: React.FC<Props> = (props: Props) => {
  const context = useConnectedWeb3Context()

  const { marketMakerAddress } = props
  const { question, resolution } = useQuestion(marketMakerAddress, context)
  const { marketMakerData } = useMarketMakerData(marketMakerAddress, context)
  const {
    totalPoolShares,
    userPoolShares,
    balances,
    marketMakerFunding,
    marketMakerUserFunding,
    collateral,
  } = marketMakerData

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
      balances={balances}
      collateral={collateral}
    />
  )
}

export { MarketFundContainer }
