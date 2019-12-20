import React from 'react'
import styled from 'styled-components'
import DatePicker from 'react-datepicker'
import moment from 'moment'

import { IconCalendar } from './img/IconCalendar'

interface Props {
  disabled?: boolean
  minDate?: any
  name: string
  onChange: any
  selected?: any
}

const DateFieldWrapper = styled.div<{ disabled?: boolean }>`
  border-bottom: solid 1px #999;
  border-left: none;
  border-radius: 0;
  border-right: none;
  border-top: none;
  color: #000;
  cursor: ${props => (props.disabled ? 'not-allowed' : 'default')};
  font-size: 13px;
  font-weight: normal;
  opacity: ${props => (props.disabled ? '0.5' : '1')};
  outline: none;
  padding: 6px 25px 6px 4px;
  position: relative;
  width: 100%;

  > svg {
    position: absolute;
    right: 4px;
    top: 50%;
    transform: translateY(-50%);
    z-index: 5;
  }

  > div > div > input {
    background-color: transparent;
    border: none;
    color: #000;
    font-size: 13px;
    outline: none;
    padding: 0;
    width: 100%;

    &::placeholder {
      color: #999;
    }
  }
`

export const DateField = (props: Props) => {
  const { onChange, selected, minDate, name, disabled, ...restProps } = props
  const timeInputLabel = `Time (UTC ${moment().format('Z')})`

  return (
    <DateFieldWrapper {...restProps} disabled={disabled}>
      <DatePicker
        dateFormat="Pp"
        disabled={disabled}
        minDate={minDate}
        name={name}
        onChange={onChange}
        placeholderText="Pick a date..."
        selected={selected}
        showDisabledMonthNavigation
        timeInputLabel={timeInputLabel}
        showTimeInput
      />
      <IconCalendar />
    </DateFieldWrapper>
  )
}
