import unionBy from 'lodash.unionby'
import React from 'react'
import styled from 'styled-components'

import { getArbitratorsByNetwork } from '../../../../util/networks'
import { Arbitrator } from '../../../../util/types'
import { Button } from '../../../button'
import { ArbitratorIcon } from '../arbitrator_icon'

const Wrapper = styled.div`
  display: flex;
  flex-wrap: wrap;
  margin-bottom: 12px;
`

const ArbitratorButton = styled(Button)<{ isSelected: boolean }>`
  border-radius: 8px;
  height: 40px;
  margin: 0 8px 12px 0;
  &,
  &:hover {
    border-color: ${props =>
      props.isSelected ? props.theme.textfield.borderColorActive : props.theme.buttonSecondaryLine.borderColor};
  }

  & > * + * {
    margin-left: 10px;
  }
`

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

  const arbitratorOptions: Array<Arbitrator> = allArbitrators

  return (
    <Wrapper>
      {arbitratorOptions.map((arbitrator, index) => {
        return (
          <ArbitratorButton
            disabled={disabled || !arbitrator.isSelectionEnabled}
            isSelected={arbitrator.id === value.id}
            key={index}
            onClick={() => {
              onChange(arbitrator.id)
              console.warn(`Name: ${arbitrator.name} / ID: ${arbitrator.id}`)
            }}
          >
            <ArbitratorIcon id={arbitrator.id} />
            <span>{arbitrator.name}</span>
          </ArbitratorButton>
        )
      })}
    </Wrapper>
  )
}
