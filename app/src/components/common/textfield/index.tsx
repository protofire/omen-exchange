import React, { HTMLAttributes } from 'react'
import styled from 'styled-components'

interface Props extends HTMLAttributes<HTMLInputElement> {
  autoFocus?: boolean
  defaultValue?: any
  disabled?: boolean
  hasError?: boolean
  hasSuccess?: boolean
  focusOutline?: boolean
  min?: number
  name?: string
  onChange?: (event: React.ChangeEvent<HTMLInputElement>) => any
  onClick?: (event: React.MouseEvent<HTMLInputElement>) => any
  placeholder?: string
  readOnly?: boolean
  type: string
  value?: any
}

const FormInput = styled.input<{ hasError?: boolean; hasSuccess?: boolean }>`
  background-color: transparent;
  border-bottom-color: #999;
  border-bottom-style: solid;
  border-bottom-width: 1px;
  border-left: none;
  border-right: none;
  border-top: none;
  color: ${props =>
    (props.hasError && props.theme.colors.error) ||
    (props.hasSuccess && props.theme.colors.primary) ||
    '#000'};
  font-size: 13px;
  font-weight: normal;
  line-height: 1.2;
  outline: none;
  padding: 6px 4px;
  width: 100%;

  &::placeholder {
    color: ${props => props.theme.colors.textColorLight};
  }

  &:read-only,
  [readonly] {
    cursor: not-allowed;
  }

  &:disabled,
  &[disabled] {
    cursor: not-allowed;
    opacity: 0.5;
  }
`

export const Textfield = (props: Props) => {
  return <FormInput {...props} />
}
