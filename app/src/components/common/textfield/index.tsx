import React from 'react'
import styled from 'styled-components'

interface Props {
  autoFocus?: boolean
  defaultValue?: any
  disabled?: boolean
  focusOutline?: boolean
  name: string
  onChange?: (event: React.ChangeEvent<HTMLInputElement>) => any
  onClick?: (event: React.MouseEvent<HTMLInputElement>) => any
  placeholder?: string
  readOnly?: boolean
  type: string
  value?: any
}

const FormInput = styled.input`
  background-color: transparent;
  border-bottom: solid 1px #999;
  border-left: none;
  border-right: none;
  border-top: none;
  color: #000;
  font-size: 13px;
  font-weight: normal;
  outline: none;
  padding: 6px 4px;
  width: 100%;

  &::placeholder {
    color: #999;
  }

  &:disabled {
    cursor: not-allowed;
    opacity: 0.5;
  }
`

export const Textfield = (props: Props) => {
  return <FormInput {...props} />
}
