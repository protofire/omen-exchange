import React, { HTMLAttributes } from 'react'
import styled from 'styled-components'

const FormErrorWrapper = styled.p`
  color: ${props => props.theme.colors.error};
  font-size: 13px;
  font-weight: 700;
  line-height: 1.2;
  margin: 5px 0 0 0;
  text-align: left;
`

interface Props extends HTMLAttributes<HTMLParagraphElement> {
  children: React.ReactNode
}

export const FormError = (props: Props) => {
  const { children, ...restProps } = props

  return <FormErrorWrapper {...restProps}>{children}</FormErrorWrapper>
}
