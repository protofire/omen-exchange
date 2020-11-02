import React from 'react'

import { MarketViewContainer } from '../components'
import { MarketMakerData } from '../util/types'

type Props = {
  fetchMarketMakerData: () => Promise<void>
  marketMakerData: MarketMakerData
}

const MarketDetailsPage: React.FC<Props> = props => {
  return <MarketViewContainer {...props} />
}

export { MarketDetailsPage }
