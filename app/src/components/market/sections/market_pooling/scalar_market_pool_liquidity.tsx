import React from 'react'

import { MarketMakerData } from '../../../../util/types'

interface Props {
  marketMakerData: MarketMakerData
  switchMarketTab: (arg0: string) => void
}

export const ScalarMarketPoolLiquidity = (props: Props) => {
  return <p>scalar pool liquidity</p>
}
