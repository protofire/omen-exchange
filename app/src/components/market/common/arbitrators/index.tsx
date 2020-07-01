import unionBy from 'lodash.unionby'
import React from 'react'

import { getArbitratorsByNetwork } from '../../../../util/networks'
import { Arbitrator } from '../../../../util/types'
import { Dropdown, DropdownItemProps, DropdownPosition } from '../../../common/form/dropdown'

interface Props {
  customValues: Arbitrator[]
  disabled?: boolean
  networkId: number
  onChangeArbitrator: (arbitrator: Arbitrator) => any
  value: Arbitrator
}

export const Arbitrators = (props: Props) => {
  const { customValues, disabled, networkId, onChangeArbitrator, value } = props
  const arbitrators = getArbitratorsByNetwork(networkId)
  const allArbitrators = unionBy(arbitrators, customValues, 'id')

  const onChange = (id: KnownArbitrator) => {
    for (const arbitrator of allArbitrators) {
      if (arbitrator.id === id) {
        onChangeArbitrator(arbitrator)
      }
    }
  }

  const arbitratorOptions: Array<DropdownItemProps> = allArbitrators
    .filter(item => {
      return item.isSelectionEnabled
    })
    .map((arbitrator: Arbitrator) => {
      return {
        content: arbitrator.name,
        onClick: () => {
          onChange(arbitrator.id)
          console.warn(`Name: ${arbitrator.name} / ID: ${arbitrator.id}`)
        },
      }
    })

  const currentItem = allArbitrators.findIndex(arbitrator => arbitrator.id === value.id) - 1

  return (
    <Dropdown
      currentItem={currentItem}
      disabled={disabled}
      dropdownPosition={DropdownPosition.right}
      items={arbitratorOptions}
    />
  )
}
