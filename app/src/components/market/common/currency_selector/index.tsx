import React from 'react'
import styled, { css } from 'styled-components'

import { ConnectedWeb3Context, useTokens } from '../../../../hooks'
import { Token } from '../../../../util/types'
import { Dropdown, DropdownItemProps, DropdownPosition } from '../../../common/form/dropdown'
import { Spinner } from '../../../common/spinner'
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
  ${props => props.selected && CurrencyButtonSelectedCSS};
  width: 100%;
`

interface Props {
  currency?: Maybe<string>
  context: ConnectedWeb3Context
  disabled?: boolean
  filters?: Array<string>
  onSelect: (currency: Token | null) => void
  balance?: string
  placeholder?: Maybe<string>
  addAll?: boolean
}

export const CurrencySelector: React.FC<Props> = props => {
  const {
    addAll = false,
    balance,
    context,
    currency,
    disabled,
    filters = [],
    onSelect,
    placeholder,
    ...restProps
  } = props

  const tokens = useTokens(context)
  const currencyDropdownData: Array<DropdownItemProps> = []

  const onChange = (address: string) => {
    for (const token of tokens) {
      if (token.address === address) {
        onSelect(token)
      }
    }
  }

  let currentItem: number | undefined

  if (addAll) {
    currencyDropdownData.push({
      content: 'All',
      onClick: () => {
        if (!disabled) {
          onSelect(null)
        }
      },
    })

    currentItem = 0
  }

  tokens
    .filter(({ address }) => filters.length === 0 || filters.indexOf(address.toLowerCase()) >= 0)
    .forEach(({ address, image, symbol }, index) => {
      currencyDropdownData.push({
        content: <TokenItem image={image} text={symbol} />,
        extraContent: balance,
        onClick: () => {
          if (!disabled) onChange(address)
        },
      })
      if (currency && currency.toLowerCase() === address.toLowerCase()) {
        currentItem = addAll ? index + 1 : index
      }
    })

  return (
    <Wrapper {...restProps}>
      <CurrencyDropdown
        currentItem={currentItem}
        disabled={disabled}
        dropdownPosition={DropdownPosition.center}
        items={currencyDropdownData}
        maxHeight={true}
        placeholder={currency && currentItem === undefined ? <Spinner height={'18px'} width={'18px'} /> : placeholder}
        selected={false}
      />
    </Wrapper>
  )
}
