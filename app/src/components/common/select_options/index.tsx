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
  label?: string
  customValues: string[]
}

const FormOption = styled.option``

export const SelectOptions = (props: Props) => {
  const { customValues, label, ...restProps } = props

  const options = customValues.map(option => ({
    label: option,
    value: option,
  }))

  return (
    <Select {...restProps} label={label}>
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
