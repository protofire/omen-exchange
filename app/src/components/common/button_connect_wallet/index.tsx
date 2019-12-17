import React from 'react'
import styled from 'styled-components'
import { Button } from '../button'
import { ButtonType } from '../../../common/styling_types'

const ButtonStyled = styled(Button)`
  font-size: 13px;
  height: 28px;
`

interface Props {
  modalState: boolean
  onClick: () => void
}

export const ButtonConnectWallet = (props: Props) => {
  const buttonMessage = props.modalState ? 'CONNECTING...' : 'CONNECT TO A WALLET'

  return (
    <ButtonStyled
      buttonType={ButtonType.secondary}
      disabled={props.modalState}
      onClick={() => {
        props.onClick()
      }}
    >
      {buttonMessage}
    </ButtonStyled>
  )
}
