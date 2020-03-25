import moment from 'moment'
import React from 'react'
import DatePicker from 'react-datepicker'
import ReactDOM from 'react-dom'
import styled from 'styled-components'

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
        background-color: #fff;
        border-radius: 16px;
        border: 1px solid ${props => props.theme.colors.tertiary};
        box-shadow: none;
        color: ${props => props.theme.colors.textColorDark};
        cursor: pointer;
        display: block;
        font-size: 14px;
        height: 34px;
        letter-spacing: 0.2px;
        line-height: 1.2;
        outline: none;
        padding: 0 10px;
        text-align: center;
        width: 100%;

        &:focus {
          background-color: ${props => props.theme.colors.secondary};
          border-color: ${props => props.theme.colors.secondary};
          font-weight: 500;
          /**
            These two hide the blinking cursor
          */
          color: transparent;
          text-shadow: 0 0 0 ${props => props.theme.colors.primary};

          &::placeholder {
            color: ${props => props.theme.colors.primary};
            font-weight: 500;
          }
        }

        &::placeholder {
          color: #86909e;
          font-size: 14px;
          letter-spacing: 0.2px;
          line-height: 1.2;
          opacity: 1;
        }
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
        placeholderText="Select Date"
        popperContainer={CalendarPortal}
        selected={selected}
        showDisabledMonthNavigation
        showTimeSelect
        timeInputLabel={timeInputLabel}
      />
    </DateFieldWrapper>
  )
}
