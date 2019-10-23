import React from 'react'
import { RouteComponentProps } from 'react-router'

import { MarketViewContainer } from '../components'

interface RouteParams {
  address: string
}

const MarketDetailsPage = (props: RouteComponentProps<RouteParams>) => {
  return <MarketViewContainer marketMakerAddress={props.match.params.address} />
}

export { MarketDetailsPage }
