import React from 'react'
import styled from 'styled-components'
import { IconSelect } from './img/IconSelect'

interface Props {
  autoFocus?: boolean
  children: React.ReactNode
  disabled?: boolean
  name: string
  onChange?: (event: React.ChangeEvent<HTMLSelectElement>) => any
  onClick?: (event: React.MouseEvent<HTMLSelectElement>) => any
  readOnly?: boolean
  value: string
}

const SelectWrapper = styled.div<{ disabled?: boolean }>`
  cursor: ${props => (props.disabled ? 'not-allowed' : 'default')};
  opacity: ${props => (props.disabled ? '0.5' : '1')};
  position: relative;
  width: 100%;
  z-index: 1;

  > svg {
    position: absolute;
    right: 4px;
    top: 50%;
    transform: translateY(-50%);
    z-index: 1;
  }
`

SelectWrapper.defaultProps = {
  disabled: false,
}

const FormSelect = styled.select`
  -moz-appearance: none;
  -webkit-appearance: none;
  appearance: none;
  background-color: ${props => props.theme.textfield.backgroundColor};
  border-bottom-color: ${props => props.theme.textfield.borderColor};
  border-bottom-style: ${props => props.theme.textfield.borderStyle};
  border-bottom-width: ${props => props.theme.textfield.borderWidth};
  border-left: none;
  border-radius: ${props => props.theme.textfield.borderRadius};
  border-right: none;
  border-top: none;
  color: ${props => props.theme.textfield.color};
  font-size: ${props => props.theme.textfield.fontSize};
  font-weight: ${props => props.theme.textfield.fontWeight};
  outline: ${props => props.theme.textfield.outline};
  padding: ${props =>
    props.theme.textfield.paddingVertical +
    ' 25px ' +
    props.theme.textfield.paddingVertical +
    ' ' +
    props.theme.textfield.paddingHorizontal};
  position: relative;
  width: 100%;
  z-index: 2;
`

export const Select = (props: Props) => {
  const { children, ...restProps } = props

  return (
    <SelectWrapper disabled={props.disabled}>
      <FormSelect {...restProps}>{children}</FormSelect>
      <IconSelect />
    </SelectWrapper>
  )
}
