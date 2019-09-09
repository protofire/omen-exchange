import React from 'react'

interface Props {
  name: string
  value: string
  onChange?: (event: React.ChangeEvent<HTMLSelectElement>) => any
  onClick?: (event: React.MouseEvent<HTMLSelectElement>) => any
  autoFocus?: boolean
  readOnly?: boolean
}

const options = [
  { value: 'Miscellaneous', label: 'Miscellaneous' },
  { value: 'Politics', label: 'Politics' },
]

export const Categories = (props: Props) => {
  const { ...restProps } = props

  return (
    <select {...restProps}>
      <option value="" disabled>
        Select your option
      </option>
      {options.map((category: any) => {
        return (
          <option key={category.value} value={category.value}>
            {category.label}
          </option>
        )
      })}
    </select>
  )
}
