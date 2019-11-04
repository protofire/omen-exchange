import React from 'react'

import { useConnectedWeb3Context } from '../../hooks/connectedWeb3'
import { useMarketMakerData } from '../../hooks/useMarketMakerData'
import { FullLoading } from '../common/full_loading'
import { useContracts } from '../../hooks/useContracts'
import { MarketBuy } from './market_buy'
import { useQuestion } from '../../hooks/useQuestion'
import { useCheckContractExist } from '../../hooks/useCheckContractExist'
import { MarketNotFound } from '../common/market_not_found'

interface Props {
  marketMakerAddress: string
}

const MarketBuyContainer = (props: Props) => {
  const context = useConnectedWeb3Context()

  const { marketMakerAddress } = props

  const { contractExist } = useCheckContractExist(marketMakerAddress, context)

  const { question, resolution } = useQuestion(marketMakerAddress, context)

  const { balance, marketMakerFunding, collateral } = useMarketMakerData(
    marketMakerAddress,
    context,
  )

  const { conditionalTokens } = useContracts(context)

  if (!contractExist) {
    return <MarketNotFound />
  }

  if (!collateral || balance.length === 0) {
    return <FullLoading />
  }

  return (
    <MarketBuy
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

export { MarketBuyContainer }
