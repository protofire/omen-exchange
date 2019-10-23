import React from 'react'
import { RouteComponentProps } from 'react-router'

import { MarketFundContainer } from '../components'

interface RouteParams {
  address: string
}

const MarketFundPage = (props: RouteComponentProps<RouteParams>) => {
  return <MarketFundContainer marketMakerAddress={props.match.params.address} />
}

export { MarketFundPage }
