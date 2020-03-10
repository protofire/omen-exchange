import React from 'react'
import { RouteComponentProps } from 'react-router'

import { MarketPoolLiquidityContainer } from '../components'

interface RouteParams {
  address: string
}

const MarketPoolLiquidityPage = (props: RouteComponentProps<RouteParams>) => {
  const marketMakerAddress = props.match.params.address

  return <MarketPoolLiquidityContainer marketMakerAddress={marketMakerAddress} />
}

export { MarketPoolLiquidityPage }
