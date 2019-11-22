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
  networkId: number
}

const FormOption = styled.option``

export const Tokens = (props: Props) => {
  const { networkId, ...restProps } = props

  const tokens = Object.entries(knownTokens)
    .filter(([, knownToken]) => {
      return knownToken.addresses[networkId]
    })
    .sort(([, knownTokenA], [, knownTokenB]) => (knownTokenA.order > knownTokenB.order ? 1 : -1))
    .map(([id, knownToken]) => ({
      label: knownToken.symbol,
      value: id,
    }))

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
