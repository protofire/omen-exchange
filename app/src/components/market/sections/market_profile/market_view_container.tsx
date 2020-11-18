import { useWeb3React } from '@web3-react/core'
import React from 'react'

import { MarketMakerData } from '../../../../util/types'

import { MarketView } from './market_view'

interface Props {
  marketMakerData: MarketMakerData
  fetchGraphMarketMakerData: () => Promise<void>
}

const MarketViewContainer: React.FC<Props> = (props: Props) => {
  const account = useWeb3React().account as Maybe<string>
  return <MarketView account={account} {...props} />
}

export { MarketViewContainer }
