import React from 'react'
import { RouteComponentProps } from 'react-router'

import { MarketViewContainer } from '../components'
import { ConnectedWeb3, useConnectWeb3 } from '../hooks/connectedWeb3'

interface RouteParams {
  address: string
}

const MarketDetailsPage = (props: RouteComponentProps<RouteParams>) => {
  useConnectWeb3()

  return (
    <ConnectedWeb3>
      <MarketViewContainer marketMakerAddress={props.match.params.address} />
    </ConnectedWeb3>
  )
}

export { MarketDetailsPage }
