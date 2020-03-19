import React, { HTMLAttributes } from 'react'
import styled from 'styled-components'

const FormLabelWrapper = styled.label`
  color: ${props => props.theme.colors.textColorDark};
  font-size: 14px;
  font-weight: 400;
  line-height: 1.2;
`

interface Props extends HTMLAttributes<HTMLLabelElement> {
  children: React.ReactNode
}

export const FormLabel = (props: Props) => {
  const { children, ...restProps } = props

  return <FormLabelWrapper {...restProps}>{children}</FormLabelWrapper>
}
