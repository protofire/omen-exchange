import React, { HTMLAttributes, ReactNode } from 'react'
import styled from 'styled-components'

const LinkSpanStyled = styled.span`
  color: #104cfb;
  cursor: pointer;
  text-decoration: underline;

  &:hover {
    color: #222;
  }
`

interface Props extends HTMLAttributes<HTMLSpanElement> {
  children: ReactNode
  onClick?: (e?: any) => void
}

export const LinkSpan = (props: Props) => {
  const { children, onClick, ...restProps } = props

  return (
    <LinkSpanStyled onClick={onClick} {...restProps}>
      {children}
    </LinkSpanStyled>
  )
}
