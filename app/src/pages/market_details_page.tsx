import React from 'react'

import { MarketViewContainer } from '../components'
import { MarketMakerData } from '../util/types'

type Props = {
  fetchGraphMarketMakerData: () => Promise<void>
  marketMakerData: MarketMakerData
}

const MarketDetailsPage: React.FC<Props> = props => {
  return <MarketViewContainer {...props} />
}

export { MarketDetailsPage }
