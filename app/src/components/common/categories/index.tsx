import React from 'react'
import styled from 'styled-components'
import { Select } from '../select'

interface Props {
  autoFocus?: boolean
  disabled?: boolean
  name: string
  onChange?: (event: React.ChangeEvent<HTMLSelectElement>) => any
  onClick?: (event: React.MouseEvent<HTMLSelectElement>) => any
  readOnly?: boolean
  value: string
}

const FormOption = styled.option``

const options = [
  { value: 'Miscellaneous', label: 'Miscellaneous' },
  { value: 'Politics', label: 'Politics' },
]

export const Categories = (props: Props) => {
  const { ...restProps } = props

  return (
    <Select {...restProps}>
      <FormOption value="">Select a category</FormOption>
      {options.map(category => {
        return (
          <FormOption key={category.value} value={category.value}>
            {category.label}
          </FormOption>
        )
      })}
    </Select>
  )
}
