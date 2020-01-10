import React from 'react'
import styled from 'styled-components'
import unionBy from 'lodash.unionby'

import { Select } from '../select'
import { getArbitratorsByNetwork } from '../../../util/networks'
import { Arbitrator } from '../../../util/types'

interface Props {
  autoFocus?: boolean
  disabled?: boolean
  name: string
  onChangeArbitrator: (arbitrator: Arbitrator) => any
  onClick?: (event: React.MouseEvent<HTMLSelectElement>) => any
  readOnly?: boolean
  value: Arbitrator
  customValues: Arbitrator[]
  networkId: number
}

const FormOption = styled.option``

export const Arbitrators = (props: Props) => {
  const { networkId, value, customValues, onChangeArbitrator, ...restProps } = props

  const arbitrators = getArbitratorsByNetwork(networkId)
  const allArbitrators = unionBy(arbitrators, customValues, 'id')

  const options = allArbitrators.map((arbitrator: Arbitrator) => ({
    label: arbitrator.name,
    value: arbitrator.id,
  }))

  const onChange = (id: KnownArbitrator) => {
    for (const arbitrator of allArbitrators) {
      if (arbitrator.id === id) {
        onChangeArbitrator(arbitrator)
      }
    }
  }

  return (
    <Select
      {...restProps}
      value={value.id}
      onChange={e => onChange(e.target.value as KnownArbitrator)}
    >
      {options.map(option => {
        return (
          <FormOption key={option.value} value={option.value}>
            {option.label}
          </FormOption>
        )
      })}
    </Select>
  )
}
