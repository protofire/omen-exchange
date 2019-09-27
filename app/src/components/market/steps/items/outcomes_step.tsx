import React, { ChangeEvent, useState } from 'react'
import styled from 'styled-components'
import { CreateCard } from '../../create_card'
import { Button, Outcomes } from '../../../common/index'
import { ButtonContainer } from '../../../common/button_container'
import { ButtonLink } from '../../../common/button_link'
import { Well } from '../../../common/well'

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

const ButtonLinkStyled = styled(ButtonLink)`
  margin-right: auto;
`

const OutcomeInfo = styled(Well)`
  margin-bottom: 30px;
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

    if (probabilityOne < 0 || probabilityTwo < 0) {
      msgError = `Value cannot be negative`
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
  const thereIsAnError: boolean = !+probabilities[0] || !+probabilities[1] || error !== ''

  return (
    <CreateCard>
      {error && <i>{error}</i>}
      <OutcomeInfo>
        Please add all the possible outcomes for the <strong>&quot;{question}&quot;</strong>{' '}
        question.
      </OutcomeInfo>
      <Outcomes outcomes={outcomes} onChange={handleChange} />
      <ButtonContainer>
        <ButtonLinkStyled onClick={() => back()}>‹ Back</ButtonLinkStyled>
        <Button disabled={thereIsAnError || false} onClick={(e: any) => validate(e)}>
          Next
        </Button>
      </ButtonContainer>
    </CreateCard>
  )
}

export { OutcomesStep }
