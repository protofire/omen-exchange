import React, { HTMLAttributes } from 'react'
import styled from 'styled-components'

const FormErrorWrapper = styled.div`
  color: ${props => props.theme.colors.alert};
  font-family: ${props => props.theme.fonts.fontFamily};
  font-style: normal;
  font-weight: normal;
  line-height: 1.5px;
  align-items: center;
  letter-spacing: 0.2px;
  margin-top: 10px;
  white-space: nowrap;
  margin-bottom: -20px;

  &:last-child {
    margin-bottom: 0;
  }
`

interface Props extends HTMLAttributes<HTMLParagraphElement> {
  children: React.ReactNode
}

export const FormError = (props: Props) => {
  const { children, ...restProps } = props

  return <FormErrorWrapper {...restProps}>{children}</FormErrorWrapper>
}
