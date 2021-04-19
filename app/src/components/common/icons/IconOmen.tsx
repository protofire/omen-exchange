import React from 'react'
import styled from 'styled-components'

interface Props {
  style?: any
  size?: number
  dropShadow?: boolean
}

const SvgStyling = styled.svg<{ dropShadow?: boolean }>`
  ${props => props.dropShadow && 'filter: drop-shadow(3px 3px 2px rgba(0, 0, 0, 0.7));'};
`

export const IconOmen = (props: Props) => {
  const { dropShadow, size = 22, style } = props
  return (
    <SvgStyling
      dropShadow={dropShadow}
      fill="none"
      height={size}
      style={style}
      viewBox="0 0 22 22"
      width={size}
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M0 11C0 4.92487 4.92487 0 11 0C17.0751 0 22 4.92487 22 11C22 17.0751 17.0751 22 11 22C4.92487 22 0 17.0751 0 11Z"
        fill="url(#paint0_linear)"
      />
      <path
        clipRule="evenodd"
        d="M17.6107 14.9123C17.7779 14.8249 17.9573 15.0202 17.8343 15.1632C16.4042 16.8236 14.2864 17.875 11.9231 17.875C7.61632 17.875 4.125 14.3837 4.125 10.0769C4.125 7.71358 5.17633 5.5958 6.83683 4.16574C6.97974 4.04266 7.17504 4.22214 7.08765 4.38928C6.52351 5.46821 6.20449 6.69557 6.20449 7.99744C6.20449 12.3042 9.6958 15.7955 14.0026 15.7955C15.3044 15.7955 16.5318 15.4765 17.6107 14.9123ZM10.2793 11.7206C9.36572 10.807 9.36572 9.32581 10.2793 8.41221C11.3821 7.3094 15.5177 6.11469 15.7015 6.29849C15.8853 6.48229 14.6906 10.6178 13.5878 11.7206C13.1391 12.1693 12.5534 12.3977 11.9654 12.4056C11.3561 12.4139 10.7442 12.1855 10.2793 11.7206Z"
        fill="white"
        fillRule="evenodd"
      />
      <defs>
        <linearGradient gradientUnits="userSpaceOnUse" id="paint0_linear" x1="11" x2="11" y1="0" y2="22">
          <stop stopColor="#1565C0" />
          <stop offset="1" stopColor="#1976D2" />
        </linearGradient>
      </defs>
    </SvgStyling>
  )
}
