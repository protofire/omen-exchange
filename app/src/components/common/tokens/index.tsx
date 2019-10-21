import React from 'react'
import styled from 'styled-components'
import { Select } from '../select'
import { knownTokens } from '../../../util/addresses'

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

const tokens = Object.entries(knownTokens).map(([id, knownToken]) => ({
  label: knownToken.symbol,
  value: id,
}))

export const Tokens = (props: Props) => {
  const { ...restProps } = props

  return (
    <Select {...restProps}>
      {tokens.map(token => {
        return (
          <FormOption key={token.value} value={token.value}>
            {token.label}
          </FormOption>
        )
      })}
    </Select>
  )
}
