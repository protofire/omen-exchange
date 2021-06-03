/* eslint-disable no-console */
import React, { useEffect } from 'react'
import { useHistory } from 'react-router'

import { MarketDetailsTab, MarketMakerData } from '../../../../util/types'

import { MarketBuy } from './market_buy'
import { ScalarMarketBuy } from './scalar_market_buy'

interface Props {
  isScalar: boolean
  marketMakerData: MarketMakerData
  switchMarketTab: (arg0: MarketDetailsTab) => void
  fetchGraphMarketMakerData: () => Promise<void>
  fetchGraphMarketUserTxData: () => Promise<void>
}

const MarketBuyContainer: React.FC<Props> = (props: Props) => {
  const {
    isScalar,
    marketMakerData: { address },
  } = props

  const history = useHistory()

  useEffect(() => {
    return history.replace(`/${address}/buy`)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return <>{isScalar ? <ScalarMarketBuy {...props} /> : <MarketBuy {...props} />}</>
}

export { MarketBuyContainer }
