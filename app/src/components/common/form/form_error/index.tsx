import React, { HTMLAttributes } from 'react'
import styled from 'styled-components'

const FormErrorWrapper = styled.div`
  color: ${props => props.theme.colors.error};
  font-family: Roboto;
  font-style: normal;
  font-weight: normal;
  font-size: 14px;
  line-height: 16px;
  display: flex;
  align-items: center;
  letter-spacing: 0.2px;

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
