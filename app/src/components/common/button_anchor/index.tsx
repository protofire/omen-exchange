import React from 'react'
import styled from 'styled-components'

import { ButtonCSS, ButtonLinkProps } from '../../../theme/component_styles/button_styling_types'

const ButtonContainer = styled.a<ButtonLinkProps>`
  ${ButtonCSS}
`

export const ButtonAnchor: React.FC<ButtonLinkProps> = (props: ButtonLinkProps) => {
  const { children, ...restProps } = props

  return <ButtonContainer {...restProps}>{children}</ButtonContainer>
}
