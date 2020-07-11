import React, { InputHTMLAttributes } from 'react'
import styled, { css } from 'styled-components'

import { CommonDisabledCSS } from '../common_styled'

export const TextfieldCSS = css<{ hasError?: boolean; hasSuccess?: boolean }>`
  background-color: ${props => props.theme.textfield.backgroundColor};
  border-color: ${props => props.theme.textfield.borderColor};
  border-style: ${props => props.theme.textfield.borderStyle};
  border-width: ${props => props.theme.textfield.borderWidth};
  border-radius: ${props => props.theme.textfield.borderRadius};
  color: ${props =>
    (props.hasError && props.theme.colors.error) ||
    (props.hasSuccess && props.theme.textfield.color) ||
    props.theme.textfield.color};
  font-size: ${props => props.theme.textfield.fontSize};
  font-weight: ${props => props.theme.textfield.fontWeight};
  line-height: 1.2;
  height: ${props => props.theme.textfield.height};
  outline: ${props => props.theme.textfield.outline};
  padding: ${props => props.theme.textfield.paddingVertical + ' ' + props.theme.textfield.paddingHorizontal};
  transition: border-color 0.15s ease-in-out;
  width: 100%;

  &:hover {
    border-color: ${props => props.theme.textfield.borderColorOnHover};
  }

  &:active,
  &:focus {
    border-color: ${props => props.theme.textfield.borderColorActive};
  }

  &::placeholder {
    color: ${props => props.theme.textfield.placeholderColor};
    font-size: ${props => props.theme.textfield.placeholderFontSize};
    font-size: ${props => props.theme.textfield.placeholderFontWeight};
  }

  &:read-only,
  [readonly] {
    cursor: not-allowed;
  }

  ${CommonDisabledCSS}

  &::-webkit-inner-spin-button {
    -webkit-appearance: none;
  }
  &::-webkit-outer-spin-button {
    -webkit-appearance: none;
  }
`

const FormInput = styled.input`
  ${TextfieldCSS}
`

interface Props extends InputHTMLAttributes<HTMLInputElement> {
  defaultValue?: any
  focusOutline?: boolean
  hasError?: boolean
  hasSuccess?: boolean
}

// eslint-disable-next-line react/display-name
export const Textfield = React.forwardRef((props: Props, ref: any) => {
  return <FormInput {...props} ref={ref} />
})
