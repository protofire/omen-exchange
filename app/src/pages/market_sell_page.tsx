import React from 'react'
import { RouteComponentProps } from 'react-router'

import { MarketSellContainer } from '../components'

interface RouteParams {
  address: string
}

const MarketSellPage = (props: RouteComponentProps<RouteParams>) => {
  const marketMakerAddress = props.match.params.address

  return <MarketSellContainer marketMakerAddress={marketMakerAddress} />
}

export { MarketSellPage }
