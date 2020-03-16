import React from 'react'
import styled from 'styled-components'

import { ButtonCSS, ButtonProps, ButtonType } from '../../../theme/component_styles/button_styling_types'

const Wrapper = styled.button<ButtonSelectableProps>`
  ${ButtonCSS}
  border-color: transparent !important;
  border-radius: 6px;
  font-weight: ${props => (props.active ? '700' : '400')};
`

interface ButtonSelectableProps extends ButtonProps {
  active?: boolean
}

export const ButtonSelectable: React.FC<ButtonSelectableProps> = (props: ButtonSelectableProps) => {
  const { active = false, children, ...restProps } = props

  return (
    <Wrapper buttonType={active ? ButtonType.secondary : ButtonType.secondaryLine} {...restProps}>
      {children}
    </Wrapper>
  )
}
