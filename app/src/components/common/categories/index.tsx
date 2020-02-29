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
  customValues: string[]
}

const FormOption = styled.option``

export const Categories = (props: Props) => {
  const { customValues, ...restProps } = props

  const categories = ['Miscellaneous', 'Politics']
  const allCategories = categories.concat(customValues.filter(item => categories.indexOf(item) < 0))
  const options = allCategories.map(category => ({
    label: category,
    value: category,
  }))

  return (
    <Select {...restProps}>
      <FormOption value="">Select a category</FormOption>
      {options.map(option => {
        return (
          <FormOption key={option.value} value={option.value}>
            {option.label}
          </FormOption>
        )
      })}
    </Select>
  )
}
