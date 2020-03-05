import React, { HTMLAttributes } from 'react'
import styled, { css } from 'styled-components'

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

export const TextfieldCSS = css<{ hasError?: boolean; hasSuccess?: boolean }>`
  background-color: ${props => props.theme.textfield.backgroundColor};
  border-bottom-color: ${props => props.theme.textfield.borderColor};
  border-bottom-style: ${props => props.theme.textfield.borderStyle};
  border-bottom-width: ${props => props.theme.textfield.borderWidth};
  border-left: none;
  border-radius: ${props => props.theme.textfield.borderRadius};
  border-right: none;
  border-top: none;
  color: ${props =>
    (props.hasError && props.theme.colors.error) ||
    (props.hasSuccess && props.theme.colors.primary) ||
    props.theme.textfield.color};
  font-size: ${props => props.theme.textfield.fontSize};
  font-weight: ${props => props.theme.textfield.fontWeight};
  line-height: 1.2;
  outline: ${props => props.theme.textfield.outline};
  padding: ${props => props.theme.textfield.paddingVertical + ' ' + props.theme.textfield.paddingHorizontal};
  width: 100%;

  &::placeholder {
    color: ${props => props.theme.textfield.placeholderColor};
    font-size: ${props => props.theme.textfield.fontSize};
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

const FormInput = styled.input<{ hasError?: boolean; hasSuccess?: boolean }>`
  ${TextfieldCSS}
`

export const Textfield = (props: Props) => {
  return <FormInput {...props} />
}
