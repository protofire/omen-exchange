import React from 'react'

import { Arbitrator } from '../../../../util/types'

interface Props {
  arbitrator: Arbitrator
  questionId?: string
}

export const DisplayArbitrator: React.FC<Props> = (props: Props) => {
  const { arbitrator, questionId } = props

  const realitioUrl = questionId ? `https://realitio.github.io/#!/question/${questionId}` : 'https://realit.io/'

  return (
    <>
      <a href={realitioUrl} rel="noopener noreferrer" target="_blank">
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
