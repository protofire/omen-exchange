import React from 'react'

import { useConnectedWeb3Context } from '../../hooks/connectedWeb3'
import { useMarketMakerData } from '../../hooks/useMarketMakerData'
import { useQuestion } from '../../hooks/useQuestion'
import { Loading } from '../common'

import { MarketBuy } from './market_buy'

interface Props {
  marketMakerAddress: string
}

const MarketBuyContainer: React.FC<Props> = (props: Props) => {
  const context = useConnectedWeb3Context()

  const { marketMakerAddress } = props
  const { question, resolution } = useQuestion(marketMakerAddress, context)
  const { marketMakerData } = useMarketMakerData(marketMakerAddress, context)
  const { balances, collateral } = marketMakerData

  if (!collateral || balances.length === 0) {
    return <Loading full={true} />
  }

  return (
    <MarketBuy
      balances={balances}
      collateral={collateral}
      marketMakerAddress={marketMakerAddress}
      question={question}
      resolution={resolution}
    />
  )
}

export { MarketBuyContainer }
