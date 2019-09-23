import React, { ChangeEvent, useState } from 'react'
import styled from 'styled-components'

import { Button, Outcomes } from '../../../common/index'

interface Props {
  back: () => void
  next: () => void
  values: {
    question: string
    outcomeValueOne: string
    outcomeValueTwo: string
    outcomeProbabilityOne: string
    outcomeProbabilityTwo: string
  }
  handleChange: (event: ChangeEvent<HTMLInputElement> | ChangeEvent<HTMLSelectElement>) => any
}

const PWarn = styled.p`
  color: red;
`

const OutcomesStep = (props: Props) => {
  const { outcomeProbabilityOne, outcomeProbabilityTwo } = props.values

  const [probabilities, setProbabilities] = useState([outcomeProbabilityOne, outcomeProbabilityTwo])
  const [error, setError] = useState('')

  const handleChange = (index: number, event: ChangeEvent<HTMLInputElement>) => {
    const newProbabilities = [
      ...probabilities.slice(0, index),
      event.target.value,
      ...probabilities.slice(index + 1),
    ]
    setProbabilities(newProbabilities)
    props.handleChange(event)
  }

  const back = () => {
    props.back()
  }

  const validate = (e: any) => {
    e.preventDefault()

    const probabilityOne = +probabilities[0]
    const probabilityTwo = +probabilities[1]

    let msgError = ''
    if (!probabilityOne || !probabilityTwo) {
      msgError = `Please check the required fields`
    }

    const totalProbabilities = probabilityOne + probabilityTwo
    if (totalProbabilities === 0) {
      msgError = `The sum of the probabilities cannot be 0`
    }

    if (totalProbabilities > 100) {
      msgError = `The sum of the probabilities cannot be greater than 100`
    }

    if (totalProbabilities > 1 && totalProbabilities < 100) {
      msgError = `The sum of the probabilities cannot be less than 100`
    }

    setError(msgError)

    if (!msgError) {
      props.next()
    }
  }

  const { values } = props
  const { question, outcomeValueOne, outcomeValueTwo } = values

  const outcomes = [
    {
      value: outcomeValueOne,
      probability: probabilities[0],
      name: 'outcomeProbabilityOne',
    },
    {
      value: outcomeValueTwo,
      probability: probabilities[1],
      name: 'outcomeProbabilityTwo',
    },
  ]

  return (
    <>
      {error && (
        <PWarn>
          <i>{error}</i>
        </PWarn>
      )}
      <h6>Please add all the possible outcomes for the &quot;{question}&quot; question</h6>
      <Outcomes outcomes={outcomes} onChange={handleChange} />
      <div className="row">
        <div className="col left">
          <Button onClick={() => back()}>Back</Button>
        </div>
        <div className="col right">
          <Button onClick={(e: any) => validate(e)}>Next</Button>
        </div>
      </div>
    </>
  )
}

export { OutcomesStep }
