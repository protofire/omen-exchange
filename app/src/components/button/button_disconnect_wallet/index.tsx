import React from 'react'
import { useWeb3Context } from 'web3-react'

import { Button } from '../button'
import { ButtonProps, ButtonType } from '../button_styling_types'

interface Props extends ButtonProps {
  callback: () => void
}

export const ButtonDisconnectWallet = (props: Props) => {
  const { callback, ...restProps } = props
  const context = useWeb3Context()
  const { account, active, connectorName, error } = context

  if (!account) {
    return null
  }

  const logout = () => {
    if (active || (error && connectorName)) {
      callback()
      localStorage.removeItem('CONNECTOR')
      context.setConnector('Infura')
    }
  }

  return (
    <Button buttonType={ButtonType.secondaryLine} onClick={logout} {...restProps}>
      Disconnect
    </Button>
  )
}
