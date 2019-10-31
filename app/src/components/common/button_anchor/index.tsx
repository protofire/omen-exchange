import React, { ReactNode, HTMLAttributes } from 'react'
import styled, { withTheme, css } from 'styled-components'
import { darken } from 'polished'

export const ButtonCSS = css<{ backgroundColor?: string }>`
  align-items: center;
  background-color: ${props => props.backgroundColor || '#00be95'};
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
  padding: 0 35px;
  text-align: center;
  text-decoration: none;
  text-transform: uppercase;
  transition: background-color 0.1s ease-out;
  white-space: nowrap;

  &:hover {
    background-color: ${props => darken(0.15, props.backgroundColor || '#00be95')};
  }

  &[disabled] {
    background-color: ${props => props.backgroundColor};
    cursor: not-allowed;
    opacity: 0.5;
  }
`

const ButtonContainer = styled.a<{ backgroundColor: string }>`
  ${ButtonCSS}
`

interface Props extends HTMLAttributes<HTMLAnchorElement> {
  backgroundColor?: string
  theme?: any
  children: ReactNode
  onClick?: (e?: any) => void
  href?: string
}

const ButtonAnchorComponent: React.FC<Props> = (props: Props) => {
  const { backgroundColor, theme, children, href, ...restProps } = props

  return (
    <ButtonContainer
      backgroundColor={backgroundColor ? backgroundColor : theme.colors.primary}
      href={href}
      {...restProps}
    >
      {children}
    </ButtonContainer>
  )
}

export const ButtonAnchor = withTheme(ButtonAnchorComponent)
