import React, { HTMLAttributes } from 'react'
import styled from 'styled-components'

interface FormStateButtonWrapperProps {
  active?: boolean
}

const FormStateButtonWrapper = styled.span<FormStateButtonWrapperProps>`
  color: ${({ active, theme }) => (active ? theme.colors.primary : theme.colors.clickable)};
  background-color: ${({ active, theme }) => (active ? theme.colors.verticalDivider : '')};
  font-weight: ${({ active }) => (active ? '500' : 'normal')};
  cursor: pointer;
  font-size: 14px;
  font-weight: 400;
  line-height: 1.2;
  text-decoration: none;
  padding: 10px 18px;
  border-radius: 18px;
  position: relative;
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
