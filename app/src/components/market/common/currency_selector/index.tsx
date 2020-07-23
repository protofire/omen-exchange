import React from 'react'
import styled, { css } from 'styled-components'

import { ConnectedWeb3Context, useTokens } from '../../../../hooks'
import { Token } from '../../../../util/types'
import { Button } from '../../../button'
import { ButtonType } from '../../../button/button_styling_types'
import { Dropdown, DropdownItemProps, DropdownPosition } from '../../../common/form/dropdown'
import { TokenItem } from '../token_item'

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

const CurrencyButton = styled(Button)<{ selected: boolean }>`
  margin-bottom: 8px;
  margin-right: 8px;

  ${props => props.selected && CurrencyButtonSelectedCSS}
`

const CurrencyDropdown = styled(Dropdown)<{ selected: boolean }>`
  ${props => props.selected && CurrencyButtonSelectedCSS}
`

interface Props {
  context: ConnectedWeb3Context
  disabled?: boolean
  onSelect: (currency: Token) => void
  selectedCurrency: Token
}

export const CurrencySelector: React.FC<Props> = props => {
  const { context, disabled, onSelect, selectedCurrency, ...restProps } = props

  const tokens = useTokens(context)

  const currencyButtons = tokens.slice(0, 4)
  const currencyMore = tokens.slice(4, tokens.length + 1)

  const currencyDropdownData: Array<DropdownItemProps> = []

  const onChange = (address: string) => {
    for (const token of tokens) {
      if (token.address === address) {
        onSelect(token)
      }
    }
  }

  currencyMore.forEach(({ address, image, symbol }) => {
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

  const isValueInDropdown = (currency: string): boolean => {
    return currencyMore.some(item => currency === item.address)
  }

  return (
    <Wrapper {...restProps}>
      {currencyButtons.map((item, index) => {
        return (
          <CurrencyButton
            buttonType={ButtonType.secondaryLine}
            disabled={disabled}
            key={index}
            onClick={() => {
              onChange(item.address)
            }}
            selected={selectedCurrency.address === item.address}
          >
            {item.image ? <TokenItem image={item.image} key={index} text={item.symbol} /> : item.symbol}
          </CurrencyButton>
        )
      })}
      {currencyDropdownData.length > 0 && (
        <CurrencyDropdown
          disabled={disabled}
          dropdownPosition={DropdownPosition.right}
          items={currencyDropdownData}
          placeholder={'More'}
          selected={isValueInDropdown(selectedCurrency.address)}
        />
      )}
    </Wrapper>
  )
}
