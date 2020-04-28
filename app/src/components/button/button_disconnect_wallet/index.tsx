import React, { useState } from 'react'
import styled from 'styled-components'
import { useWeb3Context } from 'web3-react'

import { Spinner } from '../../common/spinner'
import { Button } from '../button'
import { ButtonProps, ButtonType } from '../button_styling_types'

const SpinnerStyled = styled(Spinner)`
  margin-right: 10px;
`

interface Props extends ButtonProps {
  callback: () => void
}

export const ButtonDisconnectWallet = (props: Props) => {
  const { callback, ...restProps } = props
  const context = useWeb3Context()
  const { account, active, connectorName, error } = context
  const [isWorking, setIsWorking] = useState(false)

  const logout = () => {
    if (active || (error && connectorName)) {
      setIsWorking(true)
      callback()
      localStorage.removeItem('CONNECTOR')
      context.setConnector('Infura')
    }
  }

  return account ? (
    <Button buttonType={ButtonType.secondaryLine} disabled={isWorking} onClick={logout} {...restProps}>
      {isWorking && <SpinnerStyled height={'15px'} width={'15px'} />} Disconnect
    </Button>
  ) : null
}
