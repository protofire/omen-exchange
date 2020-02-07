import React, { useEffect, useState } from 'react'
import styled from 'styled-components'
import { Select } from '../select'
import { Token } from '../../../util/types'
import { ConnectedWeb3Context } from '../../../hooks/connectedWeb3'
import { useContracts } from '../../../hooks/useContracts'

interface Props {
  autoFocus?: boolean
  disabled?: boolean
  name: string
  onTokenChange: (token: Token) => any
  onClick?: (event: React.MouseEvent<HTMLSelectElement>) => any
  readOnly?: boolean
  value: Token
  context: ConnectedWeb3Context
}

const FormOption = styled.option``

export const Tokens = (props: Props) => {
  const { context, value, onTokenChange, ...restProps } = props

  const [tokens, setTokens] = useState<Token[]>([])
  const { kleros } = useContracts(context)

  useEffect(() => {
    const fetchTokens = async () => {
      const tokens = await kleros.queryTokens()
      setTokens(tokens)
    }

    fetchTokens()
  }, [kleros])

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
