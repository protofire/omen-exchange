import React from 'react'

import { Arbitrator } from '../../../../util/types'

interface Props {
  arbitrator: Arbitrator
}

export const DisplayArbitrator: React.FC<Props> = (props: Props) => {
  const { arbitrator } = props

  return (
    <>
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
