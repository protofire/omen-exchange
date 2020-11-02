import { BigNumber } from 'ethers/utils'
import React from 'react'

import { MarketMakerData } from '../../../../util/types'
import { GridTransactionDetails } from '../../common/grid_transaction_details'
import { MarketScale } from '../../common/market_scale'

interface Props {
  marketMakerData: MarketMakerData
  switchMarketTab: (arg0: string) => void
}

export const ScalarMarketBuy = (props: Props) => {
  return <p>scalar buy</p>
}
