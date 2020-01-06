import React from 'react'
import styled from 'styled-components'

interface Props {
  disabled?: boolean
  formField: any
  placeholderText: any
}

const FieldWrapper = styled.div<{ disabled?: boolean }>`
  border-bottom-color: ${props => (props.disabled ? 'rgba(153, 153, 153, 0.5)' : '#999')};
  border-bottom-style: solid;
  border-bottom-width: 1px;
  display: flex;
  outline: none;
  padding: 6px 4px;
  width: 100%;

  > input {
    border: none;
    color: ${props => props.theme.colors.textColor};
    flex-grow: 1;
    font-family: ${props => props.theme.fonts.fontFamily};
    font-size: 13px;
    font-weight: normal;
    margin: 0 5px 0 0;
    padding: 0;

    &::placeholder {
      color: ${props => props.theme.colors.textColorLight};
      font-family: ${props => props.theme.fonts.fontFamily};
      font-size: 13px;
    }

    &:disabled {
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
  color: ${props => props.theme.colors.textColorLight};
  flex-shrink: 0;
  font-size: 13px;
  font-weight: normal;
  line-height: 1.4;
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
