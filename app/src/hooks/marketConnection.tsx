import React from 'react'
import { useWeb3Context } from 'web3-react'

import { ConnectedWeb3, useConnectWeb3 } from '../hooks/connectedWeb3'
import connectors from '../util/connectors'

const ConnectedWrapper = (props: any) => {
  useConnectWeb3()

  return <ConnectedWeb3>{props.children}</ConnectedWeb3>
}

const DisconnectedWrapper = (props: any) => {
  return <ConnectedWeb3 infura={true}>{props.children}</ConnectedWeb3>
}

const MarketConnectionPage = (props: any) => {
  const { active } = useWeb3Context()
  const connector = localStorage.getItem('CONNECTOR')

  return active || (connector && connector in connectors) ? (
    <ConnectedWrapper {...props} />
  ) : (
    <DisconnectedWrapper {...props} />
  )
}

export { MarketConnectionPage }
