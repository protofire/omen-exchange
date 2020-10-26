import React from 'react'

interface Props {
  size?: string
}

export const IconAlert = (props: Props) => {
  const { size = '20' } = props
  return (
    <svg fill="none" height={size} viewBox={`0 0 ${size} ${size}`} width={size} xmlns="http://www.w3.org/2000/svg">
      <path
        d="m12 2c-5.52 0-10 4.48-10 10s4.48 10 10 10 10-4.48 10-10-4.48-10-10-10zm1 15h-2v-2h2v2zm0-4h-2v-6h2v6z"
        fill="#E57373"
      />
    </svg>
  )
}
