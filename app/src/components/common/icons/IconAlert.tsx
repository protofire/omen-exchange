import React from 'react'

interface Props {
  size?: string
}

export const IconAlert = (props: Props) => {
  return (
    <svg fill="none" height={props.size} viewBox="0 0 20 20" width={props.size} xmlns="http://www.w3.org/2000/svg">
      <path
        d="M10.0001 1.66666C5.40008 1.66666 1.66675 5.39999 1.66675 9.99999C1.66675 14.6 5.40008 18.3333 10.0001 18.3333C14.6001 18.3333 18.3334 14.6 18.3334 9.99999C18.3334 5.39999 14.6001 1.66666 10.0001 1.66666ZM10.8334 14.1667H9.16675V12.5H10.8334V14.1667ZM10.8334 10.8333H9.16675V5.83332H10.8334V10.8333Z"
        fill="#E57373"
      />
    </svg>
  )
}
