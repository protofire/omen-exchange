import React from 'react'
import styled from 'styled-components'

import { Dropdown, DropdownItemProps, DropdownPosition } from '../../common/dropdown'
import { currenciesData } from '../../common/icons/currencies/currencies_data'
import { TokenItem } from '../token_item'

export const CurrencySelector: React.FC = () => {
  return (
    <div>
      {currenciesData.map((item, index) => {
        return <TokenItem icon={item.icon} key={index} text={item.token} />
      })}
    </div>
  )
}
