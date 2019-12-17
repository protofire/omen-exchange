import React from 'react'
import styled from 'styled-components'
import { ButtonCSS, ButtonComponentProps, ButtonProps } from '../../../common/button_styling_types'

interface ButtonComponentPropsLocal extends ButtonComponentProps {
  href?: string
  rel?: string
  target?: string
}

const ButtonContainer = styled.a<ButtonProps>`
  ${ButtonCSS}
`

const ButtonAnchorComponent: React.FC<ButtonComponentPropsLocal> = (
  props: ButtonComponentPropsLocal,
) => {
  const { children, ...restProps } = props

  return <ButtonContainer {...restProps}>{children}</ButtonContainer>
}

export const ButtonAnchor = ButtonAnchorComponent
