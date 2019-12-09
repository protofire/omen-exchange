import React from 'react'

import { useConnectedWeb3Context } from '../../hooks/connectedWeb3'
import { useMarketMakerData } from '../../hooks/useMarketMakerData'
import { FullLoading } from '../common/full_loading'
import { MarketBuy } from './market_buy'
import { useQuestion } from '../../hooks/useQuestion'

interface Props {
  marketMakerAddress: string
}

const MarketBuyContainer: React.FC<Props> = (props: Props) => {
  const context = useConnectedWeb3Context()

  const { marketMakerAddress } = props
  const { question, resolution } = useQuestion(marketMakerAddress, context)
  const { marketMakerData } = useMarketMakerData(marketMakerAddress, context)
  const { balance, collateral } = marketMakerData

  if (!collateral || balance.length === 0) {
    return <FullLoading />
  }

  return (
    <MarketBuy
      marketMakerAddress={marketMakerAddress}
      balance={balance}
      collateral={collateral}
      question={question}
      resolution={resolution}
    />
  )
}

export { MarketBuyContainer }
