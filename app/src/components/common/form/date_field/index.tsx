import React from 'react'
import DatePicker from 'react-datepicker'
import ReactDOM from 'react-dom'
import styled from 'styled-components'

import { convertLocalToUTC, convertUTCToLocal } from '../../../../util/tools'
import { CommonDisabledCSS } from '../common_styled'

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
        border: 1px solid ${props => props.theme.buttonSecondaryLine.borderColor};
        box-shadow: none;
        color: ${props => props.theme.colors.textColorDark};
        cursor: pointer;
        display: block;
        font-size: 14px;
        height: 36px;
        letter-spacing: 0.2px;
        line-height: 16px;
        outline: none;
        padding: 0 10px;
        text-align: center;
        transition: border-color 0.15s ease-out;
        width: 100%;
        font-weight: normal;

        &:hover {
          border-color: ${props => props.theme.buttonSecondaryLine.borderColorHover};
        }

        &:focus {
          border-color: ${props => props.theme.textfield.borderColorActive};
          font-weight: normal;
          /**
            These two hide the blinking cursor
          */
          color: ${props => props.theme.textfield.backgroundColor};
          text-shadow: 0 0 0 ${props => props.theme.colors.textColorDark};

          &::placeholder {
            color: ${props => props.theme.textfield.backgroundColor};
            text-shadow: 0 0 0 ${props => props.theme.textfield.color};
            font-weight: normal;
          }
        }

        &::placeholder {
          color: #86909e;
          font-size: 14px;
          letter-spacing: 0.2px;
          line-height: 16px;
          opacity: 1;
        }

        ${CommonDisabledCSS}
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

  const handleChange = (date: Maybe<Date>) => {
    onChange(date ? convertLocalToUTC(date) : date)
  }

  const handleChangeRaw = (e: any) => {
    e.preventDefault()
  }

  return (
    <DateFieldWrapper {...restProps} disabled={disabled}>
      <DatePicker
        autoComplete="off"
        calendarClassName="customCalendar"
        dateFormat="MMMM d, yyyy h:mm aa"
        disabled={disabled}
        minDate={minDate}
        name={name}
        onChange={handleChange}
        onChangeRaw={handleChangeRaw}
        placeholderText="Select Date"
        popperContainer={CalendarPortal}
        selected={convertUTCToLocal(selected)}
        showDisabledMonthNavigation
        showTimeSelect
      />
    </DateFieldWrapper>
  )
}
