import React from 'react'

interface Props {
  type: string
  value: string
  name: string
  placeholder?: string
  onChange?: (event: React.ChangeEvent<HTMLInputElement>) => any
  onClick?: (event: React.MouseEvent<HTMLInputElement>) => any
  autoFocus?: boolean
  readOnly?: boolean
  focusOutline?: boolean
}

export const Textfield = (props: Props) => {
  return <input {...props} />
}
