import React, { DOMAttributes } from 'react'
import styled from 'styled-components'

interface Props extends DOMAttributes<HTMLDivElement> {
  state: string
}

export const ProgressBarToggle: React.FC<Props> = props => {
  const { state } = props

  const marketStates = {
    open: 'open',
    finalizing: 'finalizing',
    arbitration: 'arbitration',
    closed: 'closed',
  }

  return (
    <button>
      Market
      {state === marketStates.open
        ? ' Open'
        : state === marketStates.finalizing
        ? ' Finalizing'
        : state === marketStates.arbitration
        ? ' Arbitrating'
        : ' Closed'}
    </button>
  )
}
