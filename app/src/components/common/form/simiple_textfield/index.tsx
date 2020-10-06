import React, { InputHTMLAttributes } from 'react'
import styled, { css } from 'styled-components'

import { CommonDisabledCSS } from '../common_styled'

export const SimpleTextfieldCSS = css<{ hasError?: boolean; hasSuccess?: boolean }>`
  background-color: ${props => props.theme.textfield.backgroundColor};

  color: ${props =>
    (props.hasError && props.theme.colors.error) ||
    (props.hasSuccess && props.theme.textfield.color) ||
    props.theme.textfield.color};
  font-size: ${props => props.theme.textfield.fontSize};
  font-weight: ${props => props.theme.textfield.fontWeight};
  line-height: 1.2;
  height: ${props => props.theme.textfield.height};
  padding: ${props => props.theme.textfield.paddingVertical} 0;
  width: 100%;
  outline: none;
  border: none;

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
  ${SimpleTextfieldCSS}
`

interface Props extends InputHTMLAttributes<HTMLInputElement> {
  defaultValue?: any
  focusOutline?: boolean
  hasError?: boolean
  hasSuccess?: boolean
}

// eslint-disable-next-line react/display-name
export const SimpleTextfield = React.forwardRef((props: Props, ref: any) => {
  return <FormInput {...props} ref={ref} />
})
