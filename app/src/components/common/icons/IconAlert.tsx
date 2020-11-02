import React from 'react'

interface Props {
  size?: string
}

export const IconAlert = (props: Props) => {
  const { size = '20' } = props
  return (
    <svg fill="none" height={size} viewBox={`0 0 18 18`} width={size} xmlns="http://www.w3.org/2000/svg">
      <path
        d="M9.00008 0.666687C4.40008 0.666687 0.666748 4.40002 0.666748 9.00002C0.666748 13.6 4.40008 17.3334 9.00008 17.3334C13.6001 17.3334 17.3334 13.6 17.3334 9.00002C17.3334 4.40002 13.6001 0.666687 9.00008 0.666687ZM9.83342 13.1667H8.16675V11.5H9.83342V13.1667ZM9.83342 9.83335H8.16675V4.83335H9.83342V9.83335Z"
        fill="#E57373"
      />
    </svg>
  )
}
