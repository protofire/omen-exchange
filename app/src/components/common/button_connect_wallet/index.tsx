import React from 'react'
import styled from 'styled-components'

import { ButtonType } from '../../../theme/component_styles/button_styling_types'
import { Button } from '../button'

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
    <Wrapper buttonType={ButtonType.secondary} disabled={modalState} onClick={onClick} {...restProps}>
      {buttonMessage}
    </Wrapper>
  )
}
