import React from 'react'
interface Props {
  color?: string
  style?: any
}
export const ArrowIcon = (props: Props) => {
  const { color = 'none' } = props
  return (
    <svg fill={color} height="8" style={props.style} viewBox="0 0 11 8" width="11" xmlns="http://www.w3.org/2000/svg">
      <path d="M7.01 3H0V5H7.01V8L11 4L7.01 0V3Z" />
    </svg>
  )
}
