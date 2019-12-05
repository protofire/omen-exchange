import React from 'react'
import styled from 'styled-components'
import Dropdown from 'react-dropdown'
import 'react-dropdown/style.css'

import { MarketFilter } from '../../../util/market_filter'

const FilterWrapper = styled.div`
  display: flex;
  justify-content: flex-end;

  .Dropdown-control {
    background-color: transparent;
    border-radius: 0;
    border: none;
    box-sizing: border-box;
    color: ${props => props.theme.colors.textColor};
    cursor: pointer;
    outline: none;
    padding: 0 25px 0 0;
    transition: none;

    &:hover {
      box-shadow: none;
    }
  }

  .Dropdown-placeholder {
    color: ${props => props.theme.colors.textColor};
    font-size: 13px;
    font-weight: normal;
    line-height: 1.38;
  }

  .Dropdown-arrow {
    border-color: ${props => props.theme.colors.textColor} transparent transparent;
    border-style: solid;
    border-width: 5px 5px 0;
    content: '';
    display: block;
    height: 0;
    margin-top: 0;
    position: absolute;
    right: 0;
    top: 50%;
    transform: translateY(-50%);
    width: 0;
  }

  .Dropdown-menu {
    background-color: ${props => props.theme.dropdown.backgroundColor};
    border-radius: ${props => props.theme.dropdown.borderRadius};
    border: ${props => props.theme.dropdown.border};
    box-shadow: ${props => props.theme.dropdown.boxShadow};
    margin-top: 0;
    max-height: 400px;
    min-width: 250px;
    right: 0;
    top: calc(100% + 8px);
  }

  .Dropdown-option {
    color: ${props => props.theme.dropdown.lightTextColor};
    font-size: 15px;
    font-weight: normal;
    line-height: 1.2;
    padding: 15px 13px;
    border-bottom: 1px solid ${props => props.theme.borders.borderColor};

    &:last-child {
      border-bottom: none;
    }

    &:active,
    &:hover,
    &.is-selected {
      background-color: ${props => props.theme.colors.activeListItemBackground};
    }

    &.is-selected {
      color: ${props => props.theme.dropdown.textColor};
    }
  }
`

interface Props {
  options: MarketFilter[]
  defaultOption?: any
  onFilterChange: (filter: MarketFilter) => void
}

export const Filter: React.FC<Props> = (props: Props) => {
  const { options, defaultOption, onFilterChange, ...restProps } = props

  const onChange = (selectedOption: { value: string }) => {
    for (const option of options) {
      if (option.label === selectedOption.value) {
        onFilterChange(option)
        return
      }
    }
  }

  return (
    <FilterWrapper {...restProps}>
      <Dropdown
        options={options.map(option => option.label)}
        onChange={onChange}
        value={defaultOption}
        placeholder="Select an option"
      />
    </FilterWrapper>
  )
}
