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
  label?: string
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

const StyledLabel = styled.label`
  font-size: 11px;
  line-height: 1.36;
  color: ${props => props.theme.textfield.placeholder};
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
    `${props.theme.textfield.paddingVertical} 25px ${props.theme.textfield.paddingVertical} 0;`}
  position: relative;
  z-index: 2;

  &:read-only,
  [readonly] {
    cursor: default;
  }
`

export const Select = (props: Props) => {
  const { children, label, ...restProps } = props

  return (
    <SelectWrapper>
      {label && <StyledLabel>{label}</StyledLabel>}
      <FormSelect {...restProps}>{children}</FormSelect>
      <IconSelect />
    </SelectWrapper>
  )
}
