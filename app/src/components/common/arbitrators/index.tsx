import React from 'react'
import styled from 'styled-components'

import { Select } from '../select'
import { knownArbitrators } from '../../../util/addresses'

interface Props {
  autoFocus?: boolean
  disabled?: boolean
  name: string
  onChange?: (event: React.ChangeEvent<HTMLSelectElement>) => any
  onClick?: (event: React.MouseEvent<HTMLSelectElement>) => any
  readOnly?: boolean
  value: string
}

const FormOption = styled.option``

const arbitrators = Object.entries(knownArbitrators).map(([id, knownArbitrator]) => ({
  label: knownArbitrator.name,
  value: id,
}))

export const Arbitrators = (props: Props) => {
  const { ...restProps } = props

  return (
    <Select {...restProps}>
      {arbitrators.map(arbitrator => {
        return (
          <FormOption key={arbitrator.value} value={arbitrator.value}>
            {arbitrator.label}
          </FormOption>
        )
      })}
    </Select>
  )
}
