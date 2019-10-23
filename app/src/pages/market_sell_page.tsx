import React from 'react'
import { RouteComponentProps } from 'react-router'

import { MarketSellContainer } from '../components'

interface RouteParams {
  address: string
}

const MarketSellPage = (props: RouteComponentProps<RouteParams>) => {
  return <MarketSellContainer marketMakerAddress={props.match.params.address} />
}

export { MarketSellPage }
