import React from 'react'
import styled from 'styled-components'

interface Props {
  disabled?: boolean
  formField: any
  placeholderText: any
}

const FieldWrapper = styled.div<{ disabled?: boolean }>`
  align-items: center;
  background-color: ${props => props.theme.textfield.backgroundColor};
  border-color: ${props => props.theme.textfield.borderColor};
  border-style: ${props => props.theme.textfield.borderStyle};
  border-width: ${props => props.theme.textfield.borderWidth};
  border-radius: ${props => props.theme.textfield.borderRadius};
  height: ${props => props.theme.textfield.height};
  display: flex;
  outline: none;
  padding: ${props => props.theme.textfield.paddingVertical + ' ' + props.theme.textfield.paddingHorizontal};
  transition: border-color 0.15s ease-in-out;
  width: 100%;

  &:focus-within {
    border-color: ${props => props.theme.textfield.borderColorActive};
  }

  > input {
    border: none;
    color: ${props => props.theme.textfield.color};
    flex-grow: 1;
    font-family: ${props => props.theme.fonts.fontFamily};
    font-size: ${props => props.theme.textfield.fontSize};
    font-weight: ${props => props.theme.textfield.fontWeight};
    line-height: 1.2;
    margin: 0 5px 0 0;
    outline: ${props => props.theme.textfield.outline};
    padding: 0;

    &::placeholder {
      color: ${props => props.theme.textfield.placeholderColor};
      font-size: ${props => props.theme.textfield.placeholderFontSize};
      font-size: ${props => props.theme.textfield.placeholderFontWeight};
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

    ::-webkit-inner-spin-button {
      -webkit-appearance: none;
    }
    ::-webkit-outer-spin-button {
      -webkit-appearance: none;
    }
  }
`

FieldWrapper.defaultProps = {
  disabled: false,
}

const Placeholder = styled.span`
  color: ${props => props.theme.colors.primary};
  flex-shrink: 0;
  font-size: 14px;
  font-weight: 500;
  line-height: 1.2;
  text-align: right;
`

export const TextfieldCustomPlaceholder = (props: Props) => {
  const { disabled, formField, placeholderText, ...restProps } = props

  return (
    <FieldWrapper disabled={disabled} {...restProps}>
      {formField}
      <Placeholder>{placeholderText}</Placeholder>
    </FieldWrapper>
  )
}
