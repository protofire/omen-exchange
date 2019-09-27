import React from 'react'
import styled from 'styled-components'
import { IconTime } from './img/IconTime'
import { Textfield } from '../textfield'

interface Props {
  disabled?: boolean
  name: string
  onChange?: any
}

const TimeFieldWrapper = styled.div<{ disabled?: boolean }>`
  position: relative;

  input {
    padding-right: 20px;
    position: relative;
    z-index: 1;
  }

  > svg {
    cursor: ${props => (props.disabled ? 'not-allowed' : 'default')};
    opacity: ${props => (props.disabled ? '0.5' : '1')};
    position: absolute;
    right: 4px;
    top: 50%;
    transform: translateY(-50%);
    z-index: 5;
  }
`

export const TimeField = (props: Props) => {
  const { onChange, name, disabled, ...restProps } = props

  return (
    <TimeFieldWrapper {...restProps} disabled={disabled}>
      <Textfield
        onChange={onChange}
        name={name}
        type="text"
        placeholder="HH:MM"
        disabled={disabled}
      />
      <IconTime />
    </TimeFieldWrapper>
  )
}
