import React from 'react'
import { RouteComponentProps } from 'react-router'

import { MarketFundContainer } from '../components'
import { ConnectedWeb3, useConnectWeb3 } from '../hooks/connectedWeb3'

interface RouteParams {
  address: string
}

const MarketFundPage = (props: RouteComponentProps<RouteParams>) => {
  useConnectWeb3()

  return (
    <ConnectedWeb3>
      <MarketFundContainer marketMakerAddress={props.match.params.address} />
    </ConnectedWeb3>
  )
}

export { MarketFundPage }
