import moment from 'moment'
import React from 'react'
import DatePicker from 'react-datepicker'
import ReactDOM from 'react-dom'
import styled from 'styled-components'

import { TextfieldCSS } from '../textfield'

import IconCalendar from './img/icon.svg'

interface Props {
  disabled?: boolean
  minDate?: any
  name: string
  onChange: any
  selected?: any
}

interface CalendarPortalProps {
  children: React.ReactNode
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
          `${props.theme.textfield.paddingVertical} 25px ${props.theme.textfield.paddingVertical} ${props.theme.textfield.paddingHorizontal};`}
      }
    }
  }
`

const CalendarPortalWrapper = styled.div`
  height: 100%;
  left: 0;
  position: fixed;
  top: 0;
  width: 100%;
  z-index: 5;
`

/**
 * Had to do this to show the calendar outside of its wrapper and to avoid
 * z-index problems. It simply shows the calendar in a portal.
 */
const CalendarPortal = (props: CalendarPortalProps) => {
  const { children } = props

  return ReactDOM.createPortal(
    children ? <CalendarPortalWrapper>{children}</CalendarPortalWrapper> : null,
    document.querySelector('#portalContainer') as HTMLDivElement,
  )
}

export const DateField = (props: Props) => {
  const { disabled, minDate, name, onChange, selected, ...restProps } = props
  const timeInputLabel = `Time (UTC${moment().format('Z')})`

  return (
    <DateFieldWrapper {...restProps} disabled={disabled}>
      <DatePicker
        autoComplete="off"
        dateFormat="Pp"
        disabled={disabled}
        minDate={minDate}
        name={name}
        onChange={onChange}
        placeholderText="Pick a date..."
        popperContainer={CalendarPortal}
        selected={selected}
        showDisabledMonthNavigation
        showTimeSelect
        timeInputLabel={timeInputLabel}
      />
    </DateFieldWrapper>
  )
}
