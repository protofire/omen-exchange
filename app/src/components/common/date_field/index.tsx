import React from 'react'
import styled from 'styled-components'
import DatePicker from 'react-datepicker'
import moment from 'moment'

import IconCalendar from './img/icon.svg'
import { TextfieldCSS } from '../textfield'

interface Props {
  disabled?: boolean
  minDate?: any
  name: string
  onChange: any
  selected?: any
}

const DateFieldWrapper = styled.div<{ disabled?: boolean }>`
  border: none;
  padding: 0;
  width: 100%;

  .react-datepicker-wrapper {
    width: 100%;

    .react-datepicker__input-container {
      width: 100%;

      input {
        ${TextfieldCSS}
        background-image: url(${IconCalendar});
        background-position: calc(100% - 4px) 50%;
        background-repeat: no-repeat;
        cursor: ${props => (props.disabled ? 'not-allowed' : 'text')};
        opacity: ${props => (props.disabled ? '0.5' : '1')};
        padding: ${props =>
          props.theme.textfield.paddingVertical +
          ' 25px ' +
          props.theme.textfield.paddingVertical +
          ' ' +
          props.theme.textfield.paddingHorizontal};
      }
    }
  }
`

export const DateField = (props: Props) => {
  const { onChange, selected, minDate, name, disabled, ...restProps } = props
  const timeInputLabel = `Time (UTC${moment().format('Z')})`

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
    </DateFieldWrapper>
  )
}
