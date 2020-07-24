import { ConnectedWeb3Context, useTokens } from '../../../../hooks'
import { Token } from '../../../../util/types'
import { Dropdown, DropdownItemProps, DropdownPosition } from '../../../common/form/dropdown'
import { TokenItem } from '../token_item'

import React from 'react'
import styled, { css } from 'styled-components'

const Wrapper = styled.div`
  display: flex;
  flex-wrap: wrap;
`

const CurrencyButtonSelectedCSS = css`
  border-color: ${props => props.theme.colors.primary};
  cursor: default;
  &:hover {
    border-color: ${props => props.theme.colors.primary};
  }
`

const CurrencyDropdown = styled(Dropdown)<{ selected: boolean }>`
  ${props => props.selected && CurrencyButtonSelectedCSS}
`

interface Props {
  context: ConnectedWeb3Context
  disabled?: boolean
  onSelect: (currency: Token) => void
  selectedCurrency: Token
  balance: string
}

export const CurrencySelector: React.FC<Props> = props => {
  const { balance, context, disabled, onSelect, selectedCurrency, ...restProps } = props

  const tokens = useTokens(context)

  const currencyDropdownData: Array<DropdownItemProps> = []

  const onChange = (address: string) => {
    for (const token of tokens) {
      if (token.address === address) {
        onSelect(token)
      }
    }
  }

  tokens.forEach(({ address, image, symbol }) => {
    currencyDropdownData.push({
      content: image ? <TokenItem image={image} text={symbol} /> : symbol,
      onClick: !disabled
        ? () => {
            onChange(address)
          }
        : () => {
            return
          },
    })
  })

  return (
    <Wrapper {...restProps}>
      <CurrencyDropdown
        disabled={disabled}
        dropdownPosition={DropdownPosition.right}
        items={currencyDropdownData}
        selected={true}
      />
    </Wrapper>
  )
}
