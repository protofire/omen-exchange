import { useWeb3React } from '@web3-react/core'
import React, { useState } from 'react'
import styled from 'styled-components'

import connectors from '../../../util/connectors'
import { FullLoading } from '../../loading/full_loading'

const Button = styled.div`
  flex-grow: 1;
  text-align: left;
`

export const ButtonDisconnectWallet: React.FC = props => {
  const context = useWeb3React()
  const { account, activate, active, connector, error } = context
  const [isDisconnecting, setIsDisconnecting] = useState(false)

  const logout = () => {
    if (active || (error && connector)) {
      setIsDisconnecting(true)
      activate(connectors.Infura)
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
