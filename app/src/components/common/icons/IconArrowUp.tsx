import React from 'react'

interface Props {
  size?: string
  color?: string
}

export const IconArrowUp = (props: Props) => {
  const { size = '40' } = props
  const { color = '#E8EAF6' } = props
  return (
    <svg fill="none" height={size} viewBox="0 0 40 40" width={size} xmlns="http://www.w3.org/2000/svg">
      <path
        clipRule="evenodd"
        d="m38.5 20c0 10.217-8.2827 18.5-18.5 18.5-10.217 0-18.5-8.2827-18.5-18.5 0-10.217 8.2827-18.5 18.5-18.5 10.217 0 18.5 8.2827 18.5 18.5zm1.5 0c0 11.046-8.9543 20-20 20s-20-8.9543-20-20 8.9543-20 20-20 20 8.9543 20 20zm-26.59 1.41-1.41-1.41 8-8 8 8-1.41 1.41-5.59-5.58v12.17h-2v-12.17l-5.59 5.58z"
        fill={color}
        fillRule="evenodd"
      />
    </svg>
  )
}
