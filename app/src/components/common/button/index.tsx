import React from 'react'
import styled from 'styled-components'

import { ButtonCSS, ButtonProps } from '../../../theme/component_styles/button_styling_types'

const ButtonContainer = styled.button<ButtonProps>`
  ${ButtonCSS}
`

export const Button: React.FC<ButtonProps> = (props: ButtonProps) => {
  const { children, ...restProps } = props

  return <ButtonContainer {...restProps}>{children}</ButtonContainer>
}
