import React from 'react'

import { Arbitrator } from '../../../util/types'

interface Props {
  arbitrator: Arbitrator
}

export const DisplayArbitrator: React.FC<Props> = (props: Props) => {
  const { arbitrator } = props

  return (
    <>
      <a href="https://realit.io/" rel="noopener noreferrer" target="_blank">
        Realit.io
      </a>{' '}
      and{' '}
      {arbitrator.url ? (
        <a href={arbitrator.url} rel="noopener noreferrer" target="_blank">
          {arbitrator.name}
        </a>
      ) : (
        arbitrator.name
      )}{' '}
    </>
  )
}
