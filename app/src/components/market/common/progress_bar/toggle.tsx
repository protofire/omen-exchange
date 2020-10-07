import React, { DOMAttributes } from 'react'
import styled from 'styled-components'

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
    <button onClick={toggleProgressBar}>
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
