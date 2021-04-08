import { BigNumber } from 'ethers/utils'
import React from 'react'

import { MarketDetailsTab, MarketMakerData } from '../../../../util/types'

import { MarketBond } from './market_bond'

interface Props {
  marketMakerData: MarketMakerData
  fetchGraphMarketMakerData: () => Promise<void>
  switchMarketTab: (arg0: MarketDetailsTab) => void
  isScalar: boolean
  bondNativeAssetAmount: BigNumber
}

const MarketBondContainer: React.FC<Props> = (props: Props) => {
  return <MarketBond {...props} />
}

export { MarketBondContainer }
