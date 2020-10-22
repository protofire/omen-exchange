import React from 'react'
import styled, { css } from 'styled-components'

import { TRADING_FEE_OPTIONS } from '../../../../common/constants'
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

  const onChange = (fee: string) => {
    if (TRADING_FEE_OPTIONS.includes(fee)) onSelect(fee)
  }

  const tradingFeeDropdownItems: Array<DropdownItemProps> = TRADING_FEE_OPTIONS.map(option => {
    return {
      content: `${option}%`,
      onClick: () => onChange(option),
    }
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
      />
    </Wrapper>
  )
}
