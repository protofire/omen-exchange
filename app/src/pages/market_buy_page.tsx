import React from 'react'
import { RouteComponentProps } from 'react-router'

import { MarketBuyContainer } from '../components'

interface RouteParams {
  address: string
}

const MarketBuyPage = (props: RouteComponentProps<RouteParams>) => {
  return <MarketBuyContainer marketMakerAddress={props.match.params.address} />
}

export { MarketBuyPage }
