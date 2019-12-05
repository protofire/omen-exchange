import React from 'react'
import styled from 'styled-components'
import { Select } from '../select'
import { getTokensByNetwork } from '../../../util/addresses'
import { Token } from '../../../util/types'

interface Props {
  autoFocus?: boolean
  disabled?: boolean
  name: string
  onTokenChange: (token: Token) => any
  onClick?: (event: React.MouseEvent<HTMLSelectElement>) => any
  readOnly?: boolean
  value: Token
  customValues: Token[]
  networkId: number
}

const FormOption = styled.option``

export const Tokens = (props: Props) => {
  const { networkId, value, customValues, onTokenChange, ...restProps } = props

  const knownTokens = getTokensByNetwork(networkId)
  const tokens = knownTokens.concat(customValues)
  const options = tokens.map(token => ({
    label: token.symbol,
    value: token.address,
  }))

  const onChange = (address: string) => {
    for (const token of tokens) {
      if (token.address === address) {
        onTokenChange(token)
      }
    }
  }

  return (
    <Select {...restProps} value={value.address} onChange={e => onChange(e.target.value)}>
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
