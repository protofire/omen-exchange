import React from 'react'
import { RouteComponentProps } from 'react-router'

import { MarketSellContainer } from '../components'
import { ConnectedWeb3, useConnectWeb3 } from '../hooks/connectedWeb3'

interface RouteParams {
  address: string
}

const MarketSellPage = (props: RouteComponentProps<RouteParams>) => {
  useConnectWeb3()

  return (
    <ConnectedWeb3>
      <MarketSellContainer marketMakerAddress={props.match.params.address} />
    </ConnectedWeb3>
  )
}

export { MarketSellPage }
