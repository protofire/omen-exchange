import React from 'react'

import { MarketBuyContainer } from '../components'
import { MarketMakerData } from '../util/types'

type Props = {
  marketMakerData: MarketMakerData
}

const MarketBuyPage: React.FC<Props> = ({ marketMakerData }) => {
  return <MarketBuyContainer marketMakerData={marketMakerData} />
}

export { MarketBuyPage }
