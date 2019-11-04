import React from 'react'

import { MarketView } from './market_view'
import { useConnectedWeb3Context } from '../../hooks/connectedWeb3'
import { FullLoading } from '../common/full_loading'
import { useQuestion } from '../../hooks/useQuestion'
import { useMarketMakerData } from '../../hooks/useMarketMakerData'
import { useCheckContractExist } from '../../hooks/useCheckContractExist'
import { MarketNotFound } from '../common/market_not_found'

interface Props {
  marketMakerAddress: string
}

const MarketViewContainer = (props: Props) => {
  const context = useConnectedWeb3Context()

  const { marketMakerAddress } = props

  const { contractExist } = useCheckContractExist(marketMakerAddress, context)

  const { question, resolution } = useQuestion(marketMakerAddress, context)

  const { marketMakerFunding, balance, winnerOutcome, status, collateral } = useMarketMakerData(
    marketMakerAddress,
    context,
  )

  if (!contractExist) {
    return <MarketNotFound />
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
      winnerOutcome={winnerOutcome}
      collateral={collateral}
    />
  )
}

export { MarketViewContainer }
