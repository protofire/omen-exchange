import React from 'react'
import { RouteComponentProps } from 'react-router'

import { MarketViewContainer } from '../components'

interface RouteParams {
  address: string
}

const MarketDetailsPage = (props: RouteComponentProps<RouteParams>) => {
  const marketMakerAddress = props.match.params.address

  return <MarketViewContainer marketMakerAddress={marketMakerAddress} />
}

export { MarketDetailsPage }
