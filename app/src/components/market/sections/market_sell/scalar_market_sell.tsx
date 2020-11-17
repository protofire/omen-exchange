import React from 'react'

import { MarketMakerData } from '../../../../util/types'

interface Props {
  marketMakerData: MarketMakerData
  switchMarketTab: (arg0: string) => void
}

export const ScalarMarketSell = (props: Props) => {
  return <p>scalar sell</p>
}
