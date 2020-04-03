import React, { HTMLAttributes } from 'react'
import styled from 'styled-components'

const FormRowLinkWrapper = styled.span`
  color: ${props => props.theme.colors.primary};
  cursor: pointer;
  font-size: 14px;
  font-weight: 400;
  line-height: 1.2;
  text-decoration: none;

  &:hover {
    text-decoration: underline;
  }
`

interface Props extends HTMLAttributes<HTMLParagraphElement> {
  children: React.ReactNode
}

export const FormRowLink = (props: Props) => {
  const { children, ...restProps } = props

  return <FormRowLinkWrapper {...restProps}>{children}</FormRowLinkWrapper>
}
