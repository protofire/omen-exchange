import React, { ReactNode, HTMLAttributes } from 'react'
import styled from 'styled-components'

const ButtonContainer = styled.button`
  align-items: center;
  background-color: ${props => props.theme.colors.primary};
  border-radius: 2px;
  border: none;
  color: #fff;
  cursor: pointer;
  display: flex;
  font-size: 19px;
  font-weight: 500;
  height: 38px;
  justify-content: center;
  outline: none;
  padding: 0 25px;
  text-align: center;
  text-transform: uppercase;
  transition: background-color 0.15s ease-out;
  white-space: nowrap;

  &:hover {
    /* something */
  }

  &[disabled] {
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

export const Button = (props: Props) => {
  const { children, disabled = false, onClick, ...restProps } = props

  return (
    <ButtonContainer disabled={disabled} onClick={onClick} {...restProps}>
      {children}
    </ButtonContainer>
  )
}
