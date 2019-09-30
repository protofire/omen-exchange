import React, { HTMLAttributes } from 'react'
import styled from 'styled-components'

const FormLabelWrapper = styled.label`
  color: #000;
  font-size: 15px;
  font-weight: 500;
  line-height: 1.2;
`

interface Props extends HTMLAttributes<HTMLLabelElement> {
  children: React.ReactNode
}

export const FormLabel = (props: Props) => {
  const { children, ...restProps } = props

  return <FormLabelWrapper {...restProps}>{children}</FormLabelWrapper>
}
