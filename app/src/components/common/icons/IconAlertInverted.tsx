import React from 'react'

interface Props {
  style?: any
}

export const IconAlertInverted = (props: Props) => {
  const { style } = props
  return (
    <svg fill="none" height="20" style={style} viewBox="0 0 20 20" width="20" xmlns="http://www.w3.org/2000/svg">
      <circle cx="10" cy="10" r="9.5" stroke="#DCDFF2" />
      <path
        d="M9 14C9 13.4477 9.44772 13 10 13C10.5523 13 11 13.4477 11 14C11 14.5523 10.5523 15 10 15C9.44772 15 9 14.5523 9 14ZM9.12498 5H10.875V11H9.12498V5Z"
        fill="#86909E"
      />
    </svg>
  )
}
