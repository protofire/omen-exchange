import React from 'react'
import styled from 'styled-components'
import { IconSelect } from './img/IconSelect'
import { TextfieldCSS } from '../textfield'

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
  ${TextfieldCSS}
  padding: ${props =>
    `${props.theme.textfield.paddingVertical} 25px ${props.theme.textfield.paddingVertical} ${props.theme.textfield.paddingHorizontal};`}
  position: relative;
  z-index: 2;

  &:read-only,
  [readonly] {
    cursor: default;
  }
`

export const Select = (props: Props) => {
  const { children, ...restProps } = props

  return (
    <SelectWrapper>
      <FormSelect {...restProps}>{children}</FormSelect>
      <IconSelect />
    </SelectWrapper>
  )
}
