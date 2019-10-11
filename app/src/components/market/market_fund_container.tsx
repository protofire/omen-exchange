import React, { FC, useState } from 'react'

import { MarketFund } from './market_fund'
import { useConnectedWeb3Context } from '../../hooks/connectedWeb3'
import { useQuestion } from '../../hooks/useQuestion'

interface Props {
  marketMakerAddress: string
}

const MarketFundContainer: FC<Props> = props => {
  const context = useConnectedWeb3Context()
  const [marketMakerAddress] = useState<string>(props.marketMakerAddress)
  const { question, resolution } = useQuestion(marketMakerAddress, context)

  return (
    <MarketFund
      marketMakerAddress={marketMakerAddress}
      question={question || ''}
      resolution={resolution}
    />
  )
}

export { MarketFundContainer }
