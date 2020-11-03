import React from 'react'

import { MarketMakerData } from '../../../../util/types'

import { MarketSell } from './market_sell'

interface Props {
  isScalar: boolean
  marketMakerData: MarketMakerData
  switchMarketTab: (arg0: string) => void
<<<<<<< HEAD
  fetchGraphMarketMakerData: () => Promise<void>
}

const MarketSellContainer: React.FC<Props> = (props: Props) => {
  const { isScalar } = props

  if (isScalar) return <ScalarMarketSell {...props} />
  return <MarketSell {...props} />
=======
  isScalar: boolean
}

const MarketSellContainer: React.FC<Props> = (props: Props) => {
  const { isScalar, marketMakerData, switchMarketTab } = props

<<<<<<< HEAD
  if (isScalar) {
    return <ScalarMarketSell marketMakerData={marketMakerData} switchMarketTab={switchMarketTab} />
  } else {
    return <MarketSell marketMakerData={marketMakerData} switchMarketTab={switchMarketTab} />
  }
>>>>>>> 4bff4089... Create barebones scalar market sell view
=======
  return <MarketSell isScalar={isScalar} marketMakerData={marketMakerData} switchMarketTab={switchMarketTab} />
>>>>>>> cac9b307... Rearchitect components to keep code DRY
}

export { MarketSellContainer }
