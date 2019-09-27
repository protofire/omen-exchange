import React from 'react'
import { formatDate } from '../../../util/tools'

interface Props {
  question: string
  resolution: Date
}

const QuestionHeader = (props: Props) => {
  const { question, resolution } = props

  return (
    <>
      <h4>{question}</h4>
      <h5>Resolution date: {formatDate(resolution)}</h5>
    </>
  )
}

export { QuestionHeader }
