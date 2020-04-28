import React, { useState } from 'react'
import styled from 'styled-components'
import { useWeb3Context } from 'web3-react'

import { FullLoading } from '../../loading/full_loading'
import { ButtonProps, ButtonType } from '../button_styling_types'

const Button = styled.button`
  background-color: transparent;
  border-radius: 0;
  border: none;
  cursor: inherit;
  font-size: inherit;
  height: 100%;
  outline: none;
  padding: 0;
  text-align: left;
  width: 100%;
`

export const ButtonDisconnectWallet = (props: ButtonProps) => {
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
      <Button buttonType={ButtonType.secondaryLine} disabled={isDisconnecting} onClick={logout} {...props}>
        Disconnect
      </Button>
      {isDisconnecting && <FullLoading message="Please wait..." />}
    </>
  ) : null
}
