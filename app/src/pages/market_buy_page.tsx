import React from 'react'
import { RouteComponentProps } from 'react-router'

import { MarketBuyContainer } from '../components'

interface RouteParams {
  address: string
}

const MarketBuyPage = (props: RouteComponentProps<RouteParams>) => {
  const marketMakerAddress = props.match.params.address

  return <MarketBuyContainer marketMakerAddress={marketMakerAddress} />
}

export { MarketBuyPage }
