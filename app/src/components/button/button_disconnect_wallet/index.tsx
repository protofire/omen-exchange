import React, { useState } from 'react'
import styled from 'styled-components'
import { useWeb3Context } from 'web3-react'

import { FullLoading } from '../../loading/full_loading'

const Button = styled.div`
  flex-grow: 1;
  text-align: left;
`

export const ButtonDisconnectWallet: React.FC = props => {
  const context = useWeb3Context()
  const { account, active, connectorName, error } = context
  const [isDisconnecting, setIsDisconnecting] = useState(false)

  const logout = () => {
    if (active || (error && connectorName)) {
      setIsDisconnecting(true)
      localStorage.removeItem('CONNECTOR')
      context.setConnector('Infura')
    }
  }

  return account ? (
    <>
      <Button onClick={logout} {...props}>
        Disconnect
      </Button>
      {isDisconnecting && <FullLoading message="Please wait..." />}
    </>
  ) : null
}
