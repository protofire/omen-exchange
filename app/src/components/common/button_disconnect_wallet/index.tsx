import React from 'react'
import styled from 'styled-components'
import { useWeb3Context } from 'web3-react'

import { ButtonType } from '../../../theme/component_styles/button_styling_types'
import { Button } from '../button'

const Wrapper = styled(Button)`
  font-size: 13px;
  height: 24px;
  padding: 0 10px;
`
interface Props {
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
    <Wrapper buttonType={ButtonType.secondary} onClick={logout} {...restProps}>
      Disconnect
    </Wrapper>
  )
}
