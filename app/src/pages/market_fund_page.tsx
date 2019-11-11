import React from 'react'
import { RouteComponentProps } from 'react-router'

import { MarketFundContainer } from '../components'

interface RouteParams {
  address: string
}

const MarketFundPage = (props: RouteComponentProps<RouteParams>) => {
  const marketMakerAddress = props.match.params.address

  return <MarketFundContainer marketMakerAddress={marketMakerAddress} />
}

export { MarketFundPage }
