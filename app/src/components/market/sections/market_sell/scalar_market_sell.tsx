import React from 'react'

import { MarketDetailsTab, MarketMakerData } from '../../../../util/types'

interface Props {
  marketMakerData: MarketMakerData
  switchMarketTab: (arg0: MarketDetailsTab) => void
}

export const ScalarMarketSell = (props: Props) => {
  return <p>scalar sell</p>
}
