import React from 'react'

import theme from '../../../theme'
interface Props {
  size?: string
  color?: string
  style?: any
}

export const IconAlertInverted = (props: Props) => {
  const { color, size = '16', style } = props
  return (
    <svg fill="none" height={size} style={style} width={size} xmlns="http://www.w3.org/2000/svg">
      <circle cx="8" cy="8" r="7.5" stroke={color ? color : theme.colors.red} />
      <path
        d="M7.2 11.2a.8.8 0 0 1 1.6 0 .8.8 0 0 1-1.6 0zM7.3 4h1.4v4.8H7.3V4z"
        fill={color ? theme.colors.textColorLighter : theme.colors.red}
      />
    </svg>
  )
}
