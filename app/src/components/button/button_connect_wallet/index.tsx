import React from 'react'
import styled from 'styled-components'

import { Button } from '../button'
import { ButtonProps, ButtonType } from '../button_styling_types'

const Wrapper = styled(Button)`
  font-size: 12px;

  @media (min-width: ${props => props.theme.themeBreakPoints.md}) {
    font-size: 14px;
  }
`

interface Props extends ButtonProps {
  modalState: boolean
}

export const ButtonConnectWallet = (props: Props) => {
  const { modalState, ...restProps } = props
  const buttonMessage = modalState ? 'Connecting...' : 'Connect'

  return (
    <Wrapper buttonType={ButtonType.primary} disabled={modalState} {...restProps}>
      {buttonMessage}
    </Wrapper>
  )
}
