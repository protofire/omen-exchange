import React from 'react'
import styled, { css } from 'styled-components'

import { Dropdown, DropdownItemProps, DropdownPosition } from '../../../common/form/dropdown'

const Wrapper = styled.div`
  display: flex;
  flex-wrap: wrap;
  width: 100%;
`

const TradingFeeButtonSelectedCSS = css`
  border-color: ${props => props.theme.colors.primary};
  cursor: default;
  &:hover {
    border-color: ${props => props.theme.colors.primary};
  }
`

const TradingFeeDropdown = styled(Dropdown)<{ selected: boolean }>`
  ${props => props.selected && TradingFeeButtonSelectedCSS}
  width: 100%;
`

interface Props {
  disabled?: boolean
  onSelect: (fee: string) => void
}

export const TradingFeeSelector: React.FC<Props> = props => {
  const { disabled, onSelect, ...restProps } = props

  const tradingFeeOptions: string[] = [
    '0.00',
    '0.25',
    '0.50',
    '0.75',
    '1.00',
    '1.25',
    '1.50',
    '1.75',
    '2.00',
    '2.25',
    '2.50',
    '2.75',
    '3.00',
    '3.25',
    '3.50',
    '3.75',
    '4.00',
    '4.25',
    '4.50',
    '4.75',
    '5.00',
  ]

  const tradingFeeDropdownItems: Array<DropdownItemProps> = []

  const onChange = (fee: string) => {
    for (const option of tradingFeeOptions) {
      if (option === fee) {
        onSelect(option)
      }
    }
  }

  tradingFeeOptions.forEach(option => {
    tradingFeeDropdownItems.push({
      content: `${option}%`,
      onClick: () => onChange(option),
    })
  })

  return (
    <Wrapper {...restProps}>
      <TradingFeeDropdown
        currentItem={8}
        disabled={disabled}
        dropdownPosition={DropdownPosition.right}
        items={tradingFeeDropdownItems}
        maxHeight={true}
        selected={false}
        showScrollbar={true}
      />
    </Wrapper>
  )
}
