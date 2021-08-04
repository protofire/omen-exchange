import React from 'react'

import { MarketView } from '../../components/market/market_profile/market_view'
import { useConnectedWeb3Context } from '../../contexts'
import { MarketMakerData } from '../../util/types'

interface Props {
  marketMakerData: MarketMakerData
  fetchGraphMarketMakerData: () => Promise<void>
}

const MarketViewContainer: React.FC<Props> = (props: Props) => {
  const context = useConnectedWeb3Context()

  return <MarketView account={context.account} {...props} />
}

export { MarketViewContainer }
