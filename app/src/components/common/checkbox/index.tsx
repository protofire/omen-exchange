import React from 'react'

interface CheckboxProps extends React.HTMLAttributes<HTMLInputElement> {
  type?: never
  name?: string
}

export const Checkbox: React.FC<CheckboxProps> = props => {
  const { ...checkboxProps } = props
  return <input type="checkbox" {...checkboxProps} />
}
