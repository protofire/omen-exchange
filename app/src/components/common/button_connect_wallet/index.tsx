import React from 'react'
import styled from 'styled-components'

const ButtonConnectWalletStyled = styled.div`
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
  onClick: () => void
  modalState: boolean
}

export const ButtonConnectWallet = (props: Props) => {
  const buttonMessage = props.modalState ? 'CONNECTING...' : 'CONNECT TO A WALLET'

  return (
    <ButtonConnectWalletStyled
      onClick={() => {
        props.onClick()
      }}
    >
      <ButtonTitle>{buttonMessage}</ButtonTitle>
    </ButtonConnectWalletStyled>
  )
}
