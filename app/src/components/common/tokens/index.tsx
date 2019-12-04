import React from 'react'
import styled from 'styled-components'
import { Select } from '../select'
import { knownTokens } from '../../../util/addresses'
import { Collateral, Token } from '../../../util/types'

interface Props {
  autoFocus?: boolean
  disabled?: boolean
  name: string
  onChange?: (event: React.ChangeEvent<HTMLSelectElement>) => any
  onClick?: (event: React.MouseEvent<HTMLSelectElement>) => any
  readOnly?: boolean
  value: Token | Collateral
  customValues: Collateral[]
  networkId: number
}

const FormOption = styled.option``

export const Tokens = (props: Props) => {
  const { networkId, value, customValues, ...restProps } = props

  const tokens = Object.entries(knownTokens)
    .filter(([, knownToken]) => {
      return knownToken.addresses[networkId]
    })
    .sort(([, knownTokenA], [, knownTokenB]) => (knownTokenA.order > knownTokenB.order ? 1 : -1))
    .map(([id, knownToken]) => ({
      label: knownToken.symbol,
      value: id,
    }))

  const isTokenInKnowTokens = tokens.find(token => token.label === value.symbol)
  // Add custom values previously added
  for (const collateral of customValues) {
    const isTokenInKnowTokens = tokens.find(
      token => token.label.toLowerCase() === collateral.symbol.toLowerCase(),
    )
    if (!isTokenInKnowTokens) {
      tokens.push({
        label: collateral.symbol,
        value: collateral.address,
      })
    }
  }

  const selectedValue = { value: isTokenInKnowTokens ? value.symbol.toLowerCase() : value.address }

  return (
    <Select {...restProps} {...selectedValue}>
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
