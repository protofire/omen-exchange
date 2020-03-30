import React, { HTMLAttributes } from 'react'
import styled from 'styled-components'

const FormErrorWrapper = styled.div`
  color: ${props => props.theme.colors.error};
  font-size: 13px;
  font-weight: 500;
  line-height: 1.2;
  margin: 0 0 10px;
  text-align: left;

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
