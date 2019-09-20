import React from 'react'
import { useConnectedWeb3Context } from '../../hooks/connectedWeb3'

const ConnectionStatus: React.FC = () => {
  const context = useConnectedWeb3Context()
  const { account, networkId } = context

  return (
    <>
      <p>Account: {account || 'None'}</p>
      <p>Network ID: {networkId || 'None'}</p>
    </>
  )
}

export { ConnectionStatus }
