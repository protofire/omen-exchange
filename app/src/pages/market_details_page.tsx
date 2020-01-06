import React from 'react'
import { RouteComponentProps } from 'react-router'

import { MarketViewContainer } from '../components'
import { MarketConnectionPage } from '../hooks/marketConnection'

interface RouteParams {
  address: string
}

const MarketDetailsPage = (props: RouteComponentProps<RouteParams>) => {
  const marketMakerAddress = props.match.params.address

  return (
    <MarketConnectionPage>
      <MarketViewContainer marketMakerAddress={marketMakerAddress} />
    </MarketConnectionPage>
  )
}

export { MarketDetailsPage }
