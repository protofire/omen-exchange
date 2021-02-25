import React from 'react'

interface Props {
  fill?: string
}

export const IconCustomize = (props: Props) => {
  const { fill = '#37474F' } = props
  return (
    <svg fill="none" height="14" viewBox="0 0 14 14" width="14" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M0 10.8889V12.4444H4.66667V10.8889H0ZM0 1.55556V3.11111H7.77778V1.55556H0ZM7.77778 
          14V12.4444H14V10.8889H7.77778V9.33333H6.22222V14H7.77778ZM3.11111 
          4.66667V6.22222H0V7.77778H3.11111V9.33333H4.66667V4.66667H3.11111ZM14 
          7.77778V6.22222H6.22222V7.77778H14ZM9.33333 
          4.66667H10.8889V3.11111H14V1.55556H10.8889V0H9.33333V4.66667Z"
        fill={fill}
      />
    </svg>
  )
}
