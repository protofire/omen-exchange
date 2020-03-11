import React from 'react'
import styled from 'styled-components'

import CalendarSVG from './img/calendar.svg'

const Icon = styled.div`
  background-image: url(${CalendarSVG});
  background-position: 50% 50%;
  background-repeat: no-repeat;
  background-size: contain;
  height: 12px;
  width: 11.652px;
`

const CalendarIconWrapper = styled.div``

export const CalendarIcon: React.FC = props => {
  const { ...restProps } = props
  return (
    <CalendarIconWrapper {...restProps}>
      <Icon />
    </CalendarIconWrapper>
  )
}
