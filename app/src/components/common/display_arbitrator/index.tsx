import React from 'react'

import { Arbitrator } from '../../../util/types'

interface Props {
  arbitrator: Arbitrator
}

export const DisplayArbitrator: React.FC<Props> = (props: Props) => {
  const { arbitrator } = props

  return (
    <>
      The market will be resolved using{' '}
      <a href="https://realit.io/" rel="noopener noreferrer" target="_blank">
        Realitio
      </a>{' '}
      and{' '}
      <a href={arbitrator.url} rel="noopener noreferrer" target="_blank">
        {arbitrator.name}
      </a>{' '}
      as final arbitrator.
    </>
  )
}
