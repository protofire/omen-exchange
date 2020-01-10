import React from 'react'
import styled from 'styled-components'
import { Button } from '../button'
import { ButtonType } from '../../../common/button_styling_types'
import { useWeb3Context } from 'web3-react'

const ButtonStyled = styled(Button)`
  font-size: 13px;
  height: 28px;
  margin-left: 11px;
`
interface Props {
  callback: () => void
}

export const ButtonDisconnectWallet = (props: Props) => {
  const context = useWeb3Context()
  const { active, error, connectorName, account } = context

  if (!account) {
    return null
  }

  const logout = () => {
    if (active || (error && connectorName)) {
      props.callback()
      localStorage.removeItem('CONNECTOR')
      context.setConnector('Infura')
    }
  }

  return (
    <ButtonStyled buttonType={ButtonType.secondary} onClick={logout}>
      DISCONNECT
    </ButtonStyled>
  )
}
