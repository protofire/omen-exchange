import React from 'react'
import styled from 'styled-components'

interface Props {
  style?: any
  size?: string
}

const StyledSvg = styled.svg`
  cursor: pointer;
  &:hover {
    circle {
      stroke: ${props => props.theme.dropdown.buttonBorderColorHover};
    }
    path {
      fill: ${props => props.theme.dropdown.buttonColorHover};
    }
  }
`

export const IconAlertInverted = (props: Props) => {
  const { size = '20', ...restProps } = props
  return (
    <StyledSvg
      {...restProps}
      fill="none"
      height={size}
      viewBox="0 0 20 20"
      width={size}
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle cx="10" cy="10" r="9.5" stroke="#DCDFF2" />
      <path
        d="M9 14C9 13.4477 9.44772 13 10 13C10.5523 13 11 13.4477 11 14C11 14.5523 10.5523 15 10 15C9.44772 15 9 14.5523 9 14ZM9.12498 5H10.875V11H9.12498V5Z"
        fill="#86909E"
      />
    </StyledSvg>
  )
}
