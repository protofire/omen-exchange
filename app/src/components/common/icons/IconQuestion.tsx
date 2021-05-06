import React from 'react'
import styled from 'styled-components'

interface Props {
  size?: string
  style?: any
}

const SvgStyle = styled.svg`
  color: red;

  &:hover {
    circle {
      stroke: #c5cae9 !important;
    }
    path {
      fill: ${props => props.theme.dropdown.buttonColorHover};
    }
  }
`

export const IconQuestion = (props: Props) => {
  const { size = '16', style } = props
  return (
    <SvgStyle
      fill="none"
      height={size}
      style={style}
      viewBox="0 0 16 16"
      width={size}
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle cx="8" cy="8" r="7.5" stroke="#DCDFF2" />
      <path
        d="M7.16703 11.16C7.16703 11.6267 7.54036 12 8.00703 12C8.48036 12 8.8337 11.62 8.84036 11.16C8.84036 10.6867 8.48036 10.3267 8.00703 10.3267C7.54036 10.3267 7.16703 10.6867 7.16703 11.16Z"
        fill="#86909E"
      />
      <path
        d="M8.76703 8.51333C9.02703 8.04 9.50703 7.80667 10.0137 7.06667C10.467 6.39333 10.2937 5.49333 10.0004 5.01333C9.6537 4.44667 8.98036 4 7.9937 4C6.8137 4 6.00703 4.76667 5.70703 5.66L6.80703 6.12667C6.9537 5.67333 7.30036 5.14 8.00703 5.14C9.08703 5.14 9.30036 6.15333 8.92036 6.69333C8.56036 7.20667 7.94036 7.55333 7.6137 8.13333C7.3537 8.59333 7.40703 9.12667 7.40703 9.45333H8.62036C8.62036 8.83333 8.66036 8.70667 8.76703 8.51333Z"
        fill="#86909E"
      />
    </SvgStyle>
  )
}
