import React from 'react'

interface Props {
  color?: string
}

export const IconExclamation = (props: Props) => (
  <svg
    fill={props.color ? props.color : '#1E88E5'}
    height="16"
    viewBox="0 0 16 16"
    width="16"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M7.2 10.4h1.6V12H7.2v-1.6zm0-6.4h1.6v4.8H7.2V4zm.792-4C3.576 0 0 3.584 0 8s3.576 8 7.992 8C12.416 16 16 12.416 16 8s-3.584-8-8.008-8zM8 14.4A6.398 6.398 0 011.6 8c0-3.536 2.864-6.4 6.4-6.4 3.536 0 6.4 2.864 6.4 6.4 0 3.536-2.864 6.4-6.4 6.4z"
      fill="#7986CB"
    ></path>
  </svg>
)
