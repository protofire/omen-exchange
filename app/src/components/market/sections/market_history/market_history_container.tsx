import React, { useEffect } from 'react'
import { useHistory } from 'react-router'

import { MarketMakerData } from '../../../../util/types'

import { MarketHistory } from './market_history'

interface Props {
  marketMakerData: MarketMakerData
}

const MarketHistoryContainer: React.FC<Props> = (props: Props) => {
  const {
    marketMakerData,
    marketMakerData: { address },
  } = props

  const history = useHistory()

  useEffect(() => {
    return history.replace(`/${address}/history`)
  }, [])

  return <MarketHistory marketMakerData={marketMakerData} />
}

export { MarketHistoryContainer }
