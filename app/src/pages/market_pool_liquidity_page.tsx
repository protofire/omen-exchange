import React from 'react'

import { MarketPoolLiquidityContainer } from '../components'
import { MarketMakerData } from '../util/types'

type Props = {
  marketMakerData: MarketMakerData
}

const MarketPoolLiquidityPage: React.FC<Props> = ({ marketMakerData }) => {
  return <MarketPoolLiquidityContainer marketMakerData={marketMakerData} />
}

export { MarketPoolLiquidityPage }
