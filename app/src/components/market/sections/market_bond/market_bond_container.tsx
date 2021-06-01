import { BigNumber } from 'ethers/utils'
import React, { useEffect } from 'react'
import { useHistory } from 'react-router-dom'

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
  const {
    marketMakerData: { address },
  } = props

  const history = useHistory()

  useEffect(() => {
    history.replace(`/${address}/set_outcome`)
  })

  return <MarketBond {...props} />
}

export { MarketBondContainer }
