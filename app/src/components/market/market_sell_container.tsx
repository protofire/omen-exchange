import React from 'react'

import { useConnectedWeb3Context } from '../../hooks/connectedWeb3'
import { useMarketMakerData } from '../../hooks/useMarketMakerData'
import { FullLoading } from '../common/full_loading'
import { useContracts } from '../../hooks/useContracts'
import { MarketSell } from './market_sell'
import { useQuestion } from '../../hooks/useQuestion'

interface Props {
  marketMakerAddress: string
}

const MarketSellContainer: React.FC<Props> = (props: Props) => {
  const context = useConnectedWeb3Context()

  const { marketMakerAddress } = props
  const { question, resolution } = useQuestion(marketMakerAddress, context)
  const { marketMakerData } = useMarketMakerData(marketMakerAddress, context)
  const { balance, marketMakerFunding, collateral } = marketMakerData

  const { conditionalTokens } = useContracts(context)

  if (!collateral || balance.length === 0) {
    return <FullLoading />
  }

  return (
    <MarketSell
      marketMakerAddress={marketMakerAddress}
      marketMakerFunding={marketMakerFunding}
      balance={balance}
      collateral={collateral}
      conditionalTokens={conditionalTokens}
      question={question}
      resolution={resolution}
    />
  )
}

export { MarketSellContainer }
