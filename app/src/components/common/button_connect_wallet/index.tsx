import React from 'react'
import styled from 'styled-components'
import { Button } from '../button'
import { ButtonType } from '../../../common/button_styling_types'

const Wrapper = styled(Button)`
  font-size: 13px;
  height: 24px;
  padding: 0 10px;
`

interface Props {
  modalState: boolean
  onClick: () => void
}

export const ButtonConnectWallet = (props: Props) => {
  const { modalState, onClick, ...restProps } = props
  const buttonMessage = modalState ? 'Connecting...' : 'Connect'

  return (
    <Wrapper
      buttonType={ButtonType.secondary}
      disabled={modalState}
      onClick={onClick}
      {...restProps}
    >
      {buttonMessage}
    </Wrapper>
  )
}
