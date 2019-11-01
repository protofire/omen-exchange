import React from 'react'
import { Redirect, RouteComponentProps } from 'react-router'

import { MarketViewContainer } from '../components'
import { ConnectedWeb3, useConnectWeb3 } from '../hooks/connectedWeb3'
import { isAddress } from '../util/tools'

interface RouteParams {
  address: string
}

const MarketDetailsPage = (props: RouteComponentProps<RouteParams>) => {
  useConnectWeb3()

  const marketMakerAddress = props.match.params.address
  if (!isAddress(marketMakerAddress)) {
    return <Redirect to="/" />
  }

  return (
    <ConnectedWeb3>
      <MarketViewContainer marketMakerAddress={marketMakerAddress} />
    </ConnectedWeb3>
  )
}

export { MarketDetailsPage }
