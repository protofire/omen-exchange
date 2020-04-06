import React from 'react'

import { useMarketMakerData } from '../../hooks'
import { useConnectedWeb3Context } from '../../hooks/connectedWeb3'
import { useQuestion } from '../../hooks/useQuestion'
import { FullLoading } from '../loading'

import { MarketView } from './market_view'

interface Props {
  marketMakerAddress: string
}

const MarketViewContainer: React.FC<Props> = (props: Props) => {
  const context = useConnectedWeb3Context()

  const { marketMakerAddress } = props

  const { marketMakerData, status } = useMarketMakerData(marketMakerAddress, context)

  const { questionRaw, questionTemplateId } = useQuestion(marketMakerAddress, context)

  const { collateral } = marketMakerData

  if (!collateral) {
    return <FullLoading />
  }

  return (
    <MarketView
      account={context.account}
      collateral={collateral}
      marketMakerAddress={marketMakerAddress}
      marketMakerData={marketMakerData}
      questionRaw={questionRaw}
      questionTemplateId={questionTemplateId}
      status={status}
    />
  )
}

export { MarketViewContainer }
