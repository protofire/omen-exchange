import React from 'react'

interface Props {
  spinnerSize?: string
}

export const IconSpinner = (props: Props) => {
  const { spinnerSize = '40' } = props
  return (
    <svg fill="none" height={spinnerSize} viewBox="0 0 40 40" width={spinnerSize} xmlns="http://www.w3.org/2000/svg">
      <circle cx="20" cy="20" r="19" stroke="#E8EAF6" strokeWidth="2" />
      <path
        d="M20 39C30.4934 39 39 30.4934 39 20C39 9.50659 30.4934 1 20 1C9.50659 1 1 9.50659 1 20"
        stroke="#3F51B5"
        strokeWidth="2"
      />
    </svg>
  )
}
