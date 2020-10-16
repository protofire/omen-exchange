import React, { HTMLAttributes } from 'react'
import styled from 'styled-components'

interface FormStateButtonWrapperProps {
  active?: boolean
}

const FormStateButtonWrapper = styled.div<FormStateButtonWrapperProps>`
  font-size: 14px;
  color: ${props => (props.active ? props.theme.buttonSecondary.color : props.theme.colors.clickable)};
  background: none;
  border: none;
  border-radius: 32px;
  padding: 10px 18px;
  margin-right: 2px;
  background: ${props => (props.active ? props.theme.buttonSecondary.backgroundColor : `none`)};
  font-weight: ${props => (props.active ? `500` : `400`)};
  cursor: pointer;
  display: inline-block;

  &.disabled {
    color: ${props => props.theme.colors.textColor};
    cursor: auto;
  }
`

interface Props extends HTMLAttributes<HTMLParagraphElement> {
  children: React.ReactNode
  active?: boolean
}

export const FormStateButton = (props: Props) => {
  const { active = false, children, ...restProps } = props

  return (
    <FormStateButtonWrapper active={active} {...restProps}>
      {children}
    </FormStateButtonWrapper>
  )
}
