import React from 'react'
import styled, { css } from 'styled-components'

import { Button } from '../../button'
import { ButtonType } from '../../button/button_styling_types'
import { Dropdown, DropdownItemProps, DropdownPosition } from '../../common/dropdown'
import { currenciesData } from '../../common/icons/currencies/currencies_data'
import { TokenItem } from '../token_item'

const Wrapper = styled.div`
  display: flex;
  flex-wrap: wrap;
`

const CurrencyButtonSelectedCSS = css`
  &,
  &:hover {
    border-color: rgba(21, 101, 192, 0.7);
    cursor: default;
  }
`

const CurrencyButton = styled(Button)<{ selected: boolean }>`
  margin-bottom: 8px;
  margin-right: 8px;

  ${props => props.selected && CurrencyButtonSelectedCSS}
`

const DropdownSelectedCSS = css`
  &,
  &:hover {
    border-color: rgba(21, 101, 192, 0.7);
  }
`

const CurrencyDropdown = styled(Dropdown)<{ selected: boolean }>`
  ${props => props.selected && DropdownSelectedCSS}
`

interface Props {
  disabled?: boolean
  onSelect: (currency: string) => void
  selectedCategory: string
}

export const CurrencySelector: React.FC<Props> = props => {
  const { disabled, onSelect, selectedCategory, ...restProps } = props

  currenciesData.sort()

  const currencyButtons = currenciesData.slice(0, 3)
  const currencyOptions = currenciesData.slice(4, currenciesData.length + 1)

  const currencyDropdownData: Array<DropdownItemProps> = []

  currencyOptions.forEach(item =>
    currencyDropdownData.push({
      content: <TokenItem icon={item.icon} text={item.token} />,
      onClick: !disabled
        ? () => {
            onSelect(item.token)
          }
        : () => {
            return
          },
    }),
  )

  const isValueInDropdown = (currency: string): boolean => {
    const c = currencyOptions.map(item => {
      return currency === item.token
    })

    return c.includes(true)
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
              onSelect(item.token)
            }}
            selected={selectedCategory === item.token}
          >
            <TokenItem icon={item.icon} key={index} text={item.token} />
          </CurrencyButton>
        )
      })}
      <CurrencyDropdown
        disabled={disabled}
        dropdownPosition={DropdownPosition.right}
        items={currencyDropdownData}
        selected={isValueInDropdown(selectedCategory)}
      />
    </Wrapper>
  )
}
