import React from 'react'

import { MarketDetailsTab, MarketMakerData } from '../../../../util/types'

interface Props {
  marketMakerData: MarketMakerData
  switchMarketTab: (arg0: MarketDetailsTab) => void
}

export const ScalarMarketPoolLiquidity = (props: Props) => {
  return <p>scalar pool liquidity</p>
}
