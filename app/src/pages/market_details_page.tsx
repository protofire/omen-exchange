import React from 'react'

import { MarketViewContainer } from '../components'
import { MarketMakerData } from '../util/types'

type Props = {
  marketMakerData: MarketMakerData
}

const MarketDetailsPage: React.FC<Props> = ({ marketMakerData }) => {
  return <MarketViewContainer marketMakerData={marketMakerData} />
}

export { MarketDetailsPage }
