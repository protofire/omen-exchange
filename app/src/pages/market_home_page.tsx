import React from 'react'
import { useWeb3Context } from 'web3-react'

import { MarketHomeConnectedContainer, MarketHomeDisconnectedContainer } from '../components'
import { ConnectedWeb3, useConnectWeb3 } from '../hooks/connectedWeb3'
import { DisconnectedWeb3 } from '../hooks/disconnectedWeb3'
import connectors from '../util/connectors'

const MarketHomeConnectedWrapper = (props: any) => {
  useConnectWeb3()

  return (
    <ConnectedWeb3>
      <MarketHomeConnectedContainer {...props} />
    </ConnectedWeb3>
  )
}

const MarketHomeDisconnectedWrapper = (props: any) => {
  return (
    <DisconnectedWeb3>
      <MarketHomeDisconnectedContainer {...props} />
    </DisconnectedWeb3>
  )
}

const MarketHomePage = (props: any) => {
  const { active } = useWeb3Context()
  const connector = localStorage.getItem('CONNECTOR')

  return active || (connector && connector in connectors) ? (
    <MarketHomeConnectedWrapper {...props} />
  ) : (
    <MarketHomeDisconnectedWrapper {...props} />
  )
}

export { MarketHomePage }
