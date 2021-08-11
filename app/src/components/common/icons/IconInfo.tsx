import React from 'react'
import styled from 'styled-components'

interface Props {
  hasCircle?: boolean
  style?: any
}

const SvgStyle = styled.svg`
  &:hover {
    circle {
      stroke: ${props => props.theme.dropdown.buttonBorderColorHover};
    }
    path {
      fill: ${props => props.theme.dropdown.buttonColorHover};
    }
  }
`
export const IconInfo = ({ hasCircle = false, style }: Props) => {
  return (
    <SvgStyle fill="none" height="16" style={style} viewBox="0 0 16 16" width="16" xmlns="http://www.w3.org/2000/svg">
      {hasCircle && <circle cx="8" cy="8" r="7.5" stroke="#DCDFF2" />}
      <path
        d="M7.16666 11.16C7.16666 11.6267 7.54 12 8.00667 12C8.48 12 8.83333 11.62 8.84 11.16C8.84 10.6867 8.48 10.3267 8.00667 10.3267C7.54 10.3267 7.16666 10.6867 7.16666 11.16Z"
        fill="#86909E"
      />
      <path
        d="M8.76666 8.51333C9.02666 8.04 9.50667 7.80667 10.0133 7.06667C10.4667 6.39333 10.2933 5.49333 10 5.01333C9.65333 4.44667 8.98 4 7.99333 4C6.81333 4 6.00667 4.76667 5.70667 5.66L6.80666 6.12667C6.95333 5.67333 7.3 5.14 8.00667 5.14C9.08667 5.14 9.3 6.15333 8.92 6.69333C8.56 7.20667 7.94 7.55333 7.61333 8.13333C7.35333 8.59333 7.40666 9.12667 7.40666 9.45333H8.62C8.62 8.83333 8.66 8.70667 8.76666 8.51333Z"
        fill="#86909E"
      />
    </SvgStyle>
  )
}
