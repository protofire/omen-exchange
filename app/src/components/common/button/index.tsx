import React, { ReactNode, HTMLAttributes } from 'react'

interface Props extends HTMLAttributes<HTMLButtonElement> {
  children: ReactNode
  type?: 'button' | 'submit' | 'reset' | undefined
  disabled?: boolean
  onClick?: (e?: any) => void
}

export const Button = (props: Props) => {
  const { children, disabled = false, onClick, ...restProps } = props

  return (
    <button disabled={disabled} onClick={onClick} {...restProps}>
      {children}
    </button>
  )
}
