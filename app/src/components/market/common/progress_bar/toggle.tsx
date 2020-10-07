import React, { DOMAttributes } from 'react'
import styled from 'styled-components'

import { Button } from '../../../button'

import { ThreeDots1 } from './img/three_dots_1'
import { ThreeDots2 } from './img/three_dots_2'
import { ThreeDots3 } from './img/three_dots_3'

const ToggleButton = styled(Button)`
  height: 36px;
`

const ToggleButtonText = styled.span`
  margin-left: 13px;
`

interface Props extends DOMAttributes<HTMLDivElement> {
  state: string
  toggleProgressBar: () => void
}

export const ProgressBarToggle: React.FC<Props> = props => {
  const { state, toggleProgressBar } = props

  const marketStates = {
    open: 'open',
    finalizing: 'finalizing',
    arbitration: 'arbitration',
    closed: 'closed',
  }

  return (
    <ToggleButton onClick={toggleProgressBar}>
      {state === marketStates.open ? (
        <ThreeDots1></ThreeDots1>
      ) : state === marketStates.finalizing ? (
        <ThreeDots2></ThreeDots2>
      ) : state === marketStates.arbitration ? (
        <ThreeDots2></ThreeDots2>
      ) : (
        <ThreeDots3></ThreeDots3>
      )}
      <ToggleButtonText>
        Market
        {state === marketStates.open
          ? ' Open'
          : state === marketStates.finalizing
          ? ' Finalizing'
          : state === marketStates.arbitration
          ? ' Arbitrating'
          : ' Closed'}
      </ToggleButtonText>
    </ToggleButton>
  )
}
