import React from 'react'
import styled, { css } from 'styled-components'
import { Button } from '../button'
import { ButtonType } from '../../../common/button_styling_types'
import { useConnectedWeb3Context } from '../../../hooks/connectedWeb3'

const ButtonStyled = styled(Button)`
  font-size: 13px;
  height: 28px;
  margin-left: 11px;

`
interface Props {
  callback: () => void
}

export const ButtonDisconnectWallet = (props: Props) => {
  const context = useConnectedWeb3Context()
  const { account, rawWeb3Context } = context

  if (!account) {
    return null
  }

  const logout = () => {
    if (rawWeb3Context.active || (rawWeb3Context.error && rawWeb3Context.connectorName)) {
      props.callback()
      localStorage.removeItem('CONNECTOR')
      rawWeb3Context.unsetConnector()
    }
  }

  return (
    <ButtonStyled
      buttonType={ButtonType.secondary}
      onClick={logout}
    >
      DISCONNECT
    </ButtonStyled>
  )
}
