import React, { FC, useState } from 'react'

import { MarketFund } from './market_fund'
import { useConnectedWeb3Context } from '../../hooks/connectedWeb3'
import { getLogger } from '../../util/logger'

const logger = getLogger('Market::MarketFundContainer')

interface Props {
  marketAddress: string
}

const MarketFundContainer: FC<Props> = props => {
  const context = useConnectedWeb3Context()
  const [marketAddress] = useState<string>(props.marketAddress)

  return <MarketFund marketAddress={marketAddress} />
}

export { MarketFundContainer }
