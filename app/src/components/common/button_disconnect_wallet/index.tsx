import React from 'react'
import styled, { css } from 'styled-components'
import { useWeb3Context } from 'web3-react/dist'

const Separator = css`
  &::before {
    background-color: ${props => props.theme.header.color};
    content: '';
    height: 22px;
    margin: 0 15px;
    width: 1px;
  }
`

const LogoutWrapper = styled.div`
  align-items: center;
  display: flex;
  ${Separator}
`

const ButtonDisconnectWalletStyled = styled.div`
  width: 166px;
  height: 28px;
  border-radius: 2px;
  background-color: #ff7848;
  cursor: pointer;
`

const ButtonTitle = styled.div`
  width: 144px;
  height: 18px;
  font-family: Roboto;
  font-size: 13px;
  font-weight: 500;
  font-stretch: normal;
  font-style: normal;
  line-height: 1.38;
  letter-spacing: normal;
  text-align: center;
  color: #ffffff;
  margin-top: 5.4px;
  margin-left: 11px;
`

interface Props {
  callback: () => void
}

export const ButtonDisconnectWallet = (props: Props) => {
  const context = useWeb3Context()
  const { account } = context

  if (!account) {
    return null
  }

  const logout = () => {
    if (context.active || (context.error && context.connectorName)) {
      props.callback()
      localStorage.removeItem('CONNECTOR')
      context.unsetConnector()
    }
  }

  return (
    <LogoutWrapper>
      <ButtonDisconnectWalletStyled onClick={logout}>
        <ButtonTitle>LOGOUT</ButtonTitle>
      </ButtonDisconnectWalletStyled>
    </LogoutWrapper>
  )
}
