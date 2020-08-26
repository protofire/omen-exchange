import React, { DOMAttributes } from 'react'
import styled from 'styled-components'

interface Props extends DOMAttributes<HTMLDivElement> {
  state: 'Open' | 'Pending' | 'Finalizing' | 'Ended'
  creationTimestamp: Date
  resolutionTimestamp: Date
}

export const ProgressBar: React.FC<Props> = props => {
  return (
    <>
      Progress Bar
    </>
  )
}