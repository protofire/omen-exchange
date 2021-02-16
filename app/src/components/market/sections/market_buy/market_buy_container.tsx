import React from 'react'

import { CompoundService } from '../../../../services'
import { MarketDetailsTab, MarketMakerData } from '../../../../util/types'

import { MarketBuy } from './market_buy'
import { ScalarMarketBuy } from './scalar_market_buy'

interface Props {
  compoundService: CompoundService | null
  isScalar: boolean
  marketMakerData: MarketMakerData
  switchMarketTab: (arg0: MarketDetailsTab) => void
  fetchGraphMarketMakerData: () => Promise<void>
  fetchGraphMarketUserTxData: () => Promise<void>
}

const MarketBuyContainer: React.FC<Props> = (props: Props) => {
  const { isScalar } = props

  if (isScalar) return <ScalarMarketBuy {...props} />
  return <MarketBuy {...props} />
}

export { MarketBuyContainer }
