import React, { useState } from 'react'
import { useWeb3Context } from 'web3-react'

import { FullLoading } from '../../loading/full_loading'
import { Button } from '../button'
import { ButtonProps, ButtonType } from '../button_styling_types'

export const ButtonDisconnectWallet = (props: ButtonProps) => {
  const { ...restProps } = props
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
      <Button buttonType={ButtonType.secondaryLine} disabled={isDisconnecting} onClick={logout} {...restProps}>
        Disconnect
      </Button>
      {isDisconnecting && <FullLoading message="Please wait..." />}
    </>
  ) : null
}
