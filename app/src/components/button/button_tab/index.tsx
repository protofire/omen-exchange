import React from 'react'
import styled from 'styled-components'

import { ButtonCSS, ButtonProps, ButtonType } from '../button_styling_types'

const Wrapper = styled.button<ButtonProps>`
  ${ButtonCSS}
  border-radius: 8px;
  height: 40px;
`

interface ButtonTabProps extends ButtonProps {
  active?: boolean
  disabled?: boolean
}

export const ButtonTab: React.FC<ButtonTabProps> = (props: ButtonTabProps) => {
  const { active = false, children, disabled, ...restProps } = props

  return (
    <Wrapper buttonType={active ? ButtonType.secondary : ButtonType.secondaryLine} disabled={disabled} {...restProps}>
      {children}
    </Wrapper>
  )
}
