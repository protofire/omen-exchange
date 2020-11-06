import React from 'react'

import { MarketMakerData } from '../../../../util/types'

interface Props {
  marketMakerData: MarketMakerData
  switchMarketTab: (arg0: string) => void
}

export const ScalarMarketBuy = (props: Props) => {
  return <p>scalar buy</p>
}
