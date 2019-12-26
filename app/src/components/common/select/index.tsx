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
  border-bottom: solid 1px #999;
  border-left: none;
  border-radius: 0;
  border-right: none;
  border-top: none;
  color: ${props => props.theme.colors.textColor};
  cursor: ${props => (props.disabled ? 'not-allowed' : 'default')};
  font-size: 13px;
  font-weight: normal;
  opacity: ${props => (props.disabled ? '0.5' : '1')};
  outline: none;
  padding: 6px 0 6px 4px;
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
  background-color: transparent;
  border: none;
  color: ${props => props.theme.colors.textColor};
  font-size: 13px;
  font-weight: normal;
  outline: none;
  padding: 0 20px 0 0;
  position: relative;
  width: 100%;
  z-index: 5;
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
