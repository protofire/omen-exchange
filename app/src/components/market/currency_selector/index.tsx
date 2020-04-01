import React, { useState, useEffect } from 'react'
import styled, { css } from 'styled-components'

import { Button } from '../../button'
import { ButtonType } from '../../button/button_styling_types'
import { Dropdown, DropdownItemProps, DropdownPosition } from '../../common/dropdown'
import { currenciesData } from '../../common/icons/currencies/currencies_data'
import { TokenItem } from '../token_item'
import { IS_CORONA_VERSION } from '../../../common/constants'
import { getToken } from '../../../util/networks'
import { Token } from '../../../util/types'
import { useContracts, ConnectedWeb3Context } from '../../../hooks'

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
  context: ConnectedWeb3Context
  disabled?: boolean
  onSelect: (currency: string) => void
  selectedCategory: string
}

export const CurrencySelector: React.FC<Props> = props => {
  const { context, disabled, onSelect, selectedCategory, ...restProps } = props

  const defaultTokens = IS_CORONA_VERSION ? [getToken(context.networkId, 'usdc')] : []
  const [tokens, setTokens] = useState<Token[]>(defaultTokens)
  const { kleros } = useContracts(context)

  useEffect(() => {
    const fetchTokens = async () => {
      const tokens = await kleros.queryTokens()
      setTokens(tokens)
    }

    if (!IS_CORONA_VERSION) {
      fetchTokens()
    }
  }, [kleros])

  currenciesData.sort()
  console.log(currenciesData)
  console.log(tokens)

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
