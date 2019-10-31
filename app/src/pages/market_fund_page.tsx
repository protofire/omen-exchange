import React from 'react'
import { Redirect, RouteComponentProps } from 'react-router'

import { MarketFundContainer } from '../components'
import { ConnectedWeb3, useConnectWeb3 } from '../hooks/connectedWeb3'
import { isAddress } from '../util/tools'

interface RouteParams {
  address: string
}

const MarketFundPage = (props: RouteComponentProps<RouteParams>) => {
  useConnectWeb3()

  const marketMakerAddress = props.match.params.address
  if (!isAddress(marketMakerAddress)) {
    return <Redirect to="/" />
  }

  return (
    <ConnectedWeb3>
      <MarketFundContainer marketMakerAddress={marketMakerAddress} />
    </ConnectedWeb3>
  )
}

export { MarketFundPage }
