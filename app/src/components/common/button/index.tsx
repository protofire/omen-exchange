import React from 'react'
import styled from 'styled-components'
import { ButtonCSS, ButtonComponentProps, ButtonProps } from '../../../common/button_styling_types'

interface ButtonComponentPropsLocal extends ButtonComponentProps {
  disabled?: boolean
  type?: 'button' | 'submit' | 'reset' | undefined
}

const ButtonContainer = styled.button<ButtonProps>`
  ${ButtonCSS}
`

const ButtonComponent: React.FC<ButtonComponentPropsLocal> = (props: ButtonComponentPropsLocal) => {
  const { buttonType, children, disabled = false, onClick, ...restProps } = props

  return (
    <ButtonContainer buttonType={buttonType} disabled={disabled} onClick={onClick} {...restProps}>
      {children}
    </ButtonContainer>
  )
}

export const Button = ButtonComponent
