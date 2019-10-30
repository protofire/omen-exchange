import React from 'react'
import { RouteComponentProps } from 'react-router'

import { MarketViewContainer } from '../components'
import { NoMatchPage } from '../components/common'
import { ConnectedWeb3, useConnectWeb3 } from '../hooks/connectedWeb3'
import { isAddress } from '../util/tools'

interface RouteParams {
  address: string
}

const MarketDetailsPage = (props: RouteComponentProps<RouteParams>) => {
  useConnectWeb3()

  const marketMakerAddress = props.match.params.address

  return (
    <ConnectedWeb3>
      {isAddress(marketMakerAddress) ? (
        <MarketViewContainer marketMakerAddress={marketMakerAddress} />
      ) : (
        <NoMatchPage />
      )}
    </ConnectedWeb3>
  )
}

export { MarketDetailsPage }
