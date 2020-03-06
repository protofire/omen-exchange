import { darken } from 'polished'
import React, { HTMLAttributes, ReactNode } from 'react'
import styled from 'styled-components'

const ButtonContainer = styled.button`
  align-items: center;
  background-color: transparent;
  border-radius: 0;
  border: none;
  color: ${props => props.theme.colors.primary};
  cursor: pointer;
  display: flex;
  font-size: 14px;
  font-weight: 400;
  justify-content: center;
  outline: none;
  padding: 0;
  text-align: center;
  text-transform: none;
  transition: color 0.1s linear;
  white-space: nowrap;

  &:hover {
    color: ${props => darken(0.15, props.theme.colors.primary)};
  }

  &[disabled] {
    background-color: transparent;
    color: ${props => props.theme.colors.primary};
    cursor: not-allowed;
    opacity: 0.5;
  }
`

interface Props extends HTMLAttributes<HTMLButtonElement> {
  children: ReactNode
  disabled?: boolean
  onClick?: (e?: any) => void
  type?: 'button' | 'submit' | 'reset' | undefined
}

export const ButtonLink: React.FC<Props> = (props: Props) => {
  const { children, disabled = false, onClick, ...restProps } = props

  return (
    <ButtonContainer disabled={disabled} onClick={onClick} {...restProps}>
      {children}
    </ButtonContainer>
  )
}
