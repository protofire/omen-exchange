import React, { DOMAttributes } from 'react'
import styled from 'styled-components'

const Wrapper = styled.div`
  cursor: pointer;
  position: relative;
`

const Checkbox = styled.div<{ checked: boolean }>`
  background-color: ${props => (props.checked ? props.theme.colors.primary : '#fff')};
  border-color: ${props => props.theme.colors.primary};
  border-style: solid;
  border-width: 2px;
  box-shadow: inset 0 0 0 2px #fff;
  height: 20px;
  opacity: ${props => (props.checked ? '1' : '0.5')};
  transition: all 0.15s linear;
  width: 20px;
`

const Input = styled.input`
  cursor: pointer;
  height: 100%;
  left: 0;
  opacity: 0;
  position: absolute;
  top: 0;
  width: 100%;
  z-index: 5;
`

interface Props extends DOMAttributes<HTMLDivElement> {
  checked?: boolean
  disabled?: boolean
  name?: string
  value?: any
  inputId?: string
}

export const CheckboxInput: React.FC<Props> = props => {
  const { checked = false, disabled, inputId, name, onChange, value, ...restProps } = props
  return (
    <Wrapper {...restProps}>
      <Checkbox checked={checked} />
      <Input
        checked={checked}
        disabled={disabled}
        id={inputId}
        name={name}
        onChange={onChange}
        type="checkbox"
        value={value}
      />
    </Wrapper>
  )
}
