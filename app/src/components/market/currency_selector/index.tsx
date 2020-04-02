import React, { useEffect, useState } from 'react'
import styled, { css } from 'styled-components'

import { IS_CORONA_VERSION } from '../../../common/constants'
import { ConnectedWeb3Context, useContracts } from '../../../hooks'
import { getToken } from '../../../util/networks'
import { Token } from '../../../util/types'
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
  context: ConnectedWeb3Context
  disabled?: boolean
  onSelect: (currency: Token) => void
  selectedCurrency: Token
}

export const CurrencySelector: React.FC<Props> = props => {
  const { context, disabled, onSelect, selectedCurrency, ...restProps } = props

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

  const currencyButtons = tokens.slice(0, 4)
  const currencyMore = tokens.slice(4, currenciesData.length + 1)

  const currencyDropdownData: Array<DropdownItemProps> = []

  const onChange = (address: string) => {
    for (const token of tokens) {
      if (token.address === address) {
        onSelect(token)
      }
    }
  }

  currencyMore.forEach(({ address, symbol }) => {
    const tokenData = currenciesData.find(c => c.token === symbol)
    currencyDropdownData.push({
      content: tokenData ? <TokenItem icon={tokenData.icon} text={tokenData.text} /> : symbol,
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
        const tokenData = currenciesData.find(c => c.token === item.symbol)

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
            {tokenData ? <TokenItem icon={tokenData.icon} key={index} text={tokenData.text} /> : item.symbol}
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
