import React from 'react'
import styled from 'styled-components'

import { ButtonCSS, ButtonProps } from '../../../theme/component_styles/button_styling_types'

interface ButtonStatefulProps extends ButtonProps {
  dsdsdisabled?: boolean
}

const ButtonContainer = styled.button<ButtonProps>`
  ${ButtonCSS}
`

export const ButtonStateful: React.FC<ButtonStatefulProps> = (props: ButtonStatefulProps) => {
  const { buttonType, children, disabled = false, onClick, ...restProps } = props

  return (
    <ButtonContainer buttonType={buttonType} disabled={disabled} onClick={onClick} {...restProps}>
      {children}
    </ButtonContainer>
  )
}
