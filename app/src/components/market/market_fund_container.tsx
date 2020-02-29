import React from 'react'

import { useConnectedWeb3Context } from '../../hooks/connectedWeb3'
import { useMarketMakerData } from '../../hooks/useMarketMakerData'
import { useQuestion } from '../../hooks/useQuestion'
import { Loading } from '../common/loading'

import { MarketFund } from './market_fund'

interface Props {
  marketMakerAddress: string
}

const MarketFundContainer: React.FC<Props> = (props: Props) => {
  const context = useConnectedWeb3Context()

  const { marketMakerAddress } = props
  const { question, resolution } = useQuestion(marketMakerAddress, context)
  const { marketMakerData } = useMarketMakerData(marketMakerAddress, context)
  const {
    balances,
    collateral,
    marketMakerFunding,
    marketMakerUserFunding,
    totalPoolShares,
    userPoolShares,
  } = marketMakerData

  if (!collateral) {
    return <Loading full={true} />
  }

  return (
    <MarketFund
      balances={balances}
      collateral={collateral}
      marketMakerAddress={marketMakerAddress}
      marketMakerFunding={marketMakerFunding}
      marketMakerUserFunding={marketMakerUserFunding}
      question={question || ''}
      resolution={resolution}
      totalPoolShares={totalPoolShares}
      userPoolShares={userPoolShares}
    />
  )
}

export { MarketFundContainer }
