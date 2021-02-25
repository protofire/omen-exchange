import React from 'react'

import { useConnectedWeb3Context } from '../../../../hooks'
import { getGelatoConditionByNetwork } from '../../../../util/networks'
import { GelatoData } from '../../../../util/types'
import { Dropdown, DropdownDirection, DropdownItemProps, DropdownPosition } from '../../../common/form/dropdown'

interface Props {
  disabled?: boolean
  onChangeGelatoCondition: (gelatoData: GelatoData) => any
  value: GelatoData
}

export const GelatoConditions = (props: Props) => {
  const { disabled, onChangeGelatoCondition, value } = props
  const context = useConnectedWeb3Context()
  const networkId = context.networkId
  const gelatoConditions = getGelatoConditionByNetwork(networkId)

  const onChange = (id: KnownGelatoCondition) => {
    for (const condition of gelatoConditions) {
      if (condition.id === id) {
        onChangeGelatoCondition(condition)
      }
    }
  }

  const conditionOptions: Array<DropdownItemProps> = gelatoConditions.map((condition: GelatoData) => {
    return {
      content: condition.id + ' . .',
      onClick: () => {
        onChange(condition.id)
        console.warn(`ID: ${condition.id}`)
      },
    }
  })

  const currentItem = gelatoConditions.findIndex(condition => condition.id === value.id) - 1

  return (
    <Dropdown
      currentItem={currentItem}
      disabled={disabled}
      dropdownDirection={DropdownDirection.upwards}
      dropdownPosition={DropdownPosition.right}
      items={conditionOptions}
    />
  )
}
