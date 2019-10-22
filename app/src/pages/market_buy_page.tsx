import React from 'react'
import { RouteComponentProps } from 'react-router'

import { MarketBuyContainer } from '../components'
import { ConnectedWeb3, useConnectWeb3 } from '../hooks/connectedWeb3'

interface RouteParams {
  address: string
}

const MarketBuyPage = (props: RouteComponentProps<RouteParams>) => {
  useConnectWeb3()

  return (
    <ConnectedWeb3>
      <MarketBuyContainer marketMakerAddress={props.match.params.address} />
    </ConnectedWeb3>
  )
}

export { MarketBuyPage }
