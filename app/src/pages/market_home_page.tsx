import React from 'react'
import { useWeb3Context } from 'web3-react'

import { MarketHomeContainer } from '../components'
import { ConnectedWeb3, useConnectWeb3 } from '../hooks/connectedWeb3'
import connectors from '../util/connectors'

const MarketHomeConnectedWrapper = (props: any) => {
  useConnectWeb3()

  return (
    <ConnectedWeb3>
      <MarketHomeContainer {...props} />
    </ConnectedWeb3>
  )
}

const MarketHomeDisconnectedWrapper = (props: any) => {
  return (
    <ConnectedWeb3 infura={true}>
      <MarketHomeContainer {...props} />
    </ConnectedWeb3>
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
