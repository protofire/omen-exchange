import React from 'react'
import styled, { css } from 'styled-components'

import { ConnectedWeb3Context, useTokens } from '../../../../hooks'
import { Token } from '../../../../util/types'
import { Dropdown, DropdownItemProps, DropdownPosition } from '../../../common/form/dropdown'
import { TokenItem } from '../token_item'

const Wrapper = styled.div`
  display: flex;
  flex-wrap: wrap;
  width: 100%;
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
  width: 100%;
`

interface Props {
  context: ConnectedWeb3Context
  disabled?: boolean
  onSelect: (currency: Token) => void
  balance?: string
  placeholder?: string
}

export const CurrencySelector: React.FC<Props> = props => {
  const { balance, context, disabled, onSelect, placeholder, ...restProps } = props

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
      extraContent: balance,
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
        maxHeight={true}
        placeholder={placeholder}
        selected={false}
        showScrollbar={true}
      />
    </Wrapper>
  )
}
