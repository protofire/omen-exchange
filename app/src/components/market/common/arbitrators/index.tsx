import unionBy from 'lodash.unionby'
import React from 'react'

import { getArbitratorsByNetwork } from '../../../../util/networks'
import { Arbitrator } from '../../../../util/types'
import { Dropdown, DropdownDirection, DropdownItemProps, DropdownPosition } from '../../../common/form/dropdown'

interface Props {
  customValues: Arbitrator[]
  disabled?: boolean
  networkId: number
  onChangeArbitrator: (arbitrator: Arbitrator) => any
}

export const Arbitrators = (props: Props) => {
  const { customValues, disabled, networkId, onChangeArbitrator } = props
  const arbitrators = getArbitratorsByNetwork(networkId)
  const allArbitrators = unionBy(arbitrators, customValues, 'id')

  const onChange = (id: KnownArbitrator) => {
    for (const arbitrator of allArbitrators) {
      if (arbitrator.id === id) {
        onChangeArbitrator(arbitrator)
      }
    }
  }

  // we should use something like content: <TokenItem icon={<DxDaoIcon />} text="DxDAO" /> if we're going to display
  const arbitratorOptions: Array<DropdownItemProps> = allArbitrators.map((arbitrator: Arbitrator) => {
    return {
      content: arbitrator.name,
      onClick: () => {
        onChange(arbitrator.id)
        console.warn(`Name: ${arbitrator.name} / ID: ${arbitrator.id}`)
      },
    }
  })

  return (
    <Dropdown
      disabled={disabled}
      dropdownDirection={DropdownDirection.upwards}
      dropdownPosition={DropdownPosition.right}
      items={arbitratorOptions}
    />
  )
}
