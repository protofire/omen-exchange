import React, { ChangeEvent, useState } from 'react'
import styled from 'styled-components'
import { CreateCard } from '../../../common/create_card'
import { Button, Outcomes } from '../../../common/index'
import { ButtonContainer } from '../../../common/button_container'
import { ButtonLink } from '../../../common/button_link'
import { Well } from '../../../common/well'

const ButtonLinkStyled = styled(ButtonLink)`
  margin-right: auto;
`

const OutcomeInfo = styled(Well)`
  margin-bottom: 30px;
`

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

const OutcomesStep = (props: Props) => {
  const { outcomeProbabilityOne, outcomeProbabilityTwo } = props.values

  const [probabilities, setProbabilities] = useState([outcomeProbabilityOne, outcomeProbabilityTwo])
  const [error, setError] = useState(false)

  const validate = (newProbabilities: any) => {
    const probabilityOne = +newProbabilities[0]
    const probabilityTwo = +newProbabilities[1]
    const totalProbabilities = probabilityOne + probabilityTwo

    setError(!probabilityOne || !probabilityTwo || totalProbabilities !== 100)
  }

  const handleChange = (index: number, event: ChangeEvent<HTMLInputElement>) => {
    const newProbabilities = [
      ...probabilities.slice(0, index),
      event.target.value,
      ...probabilities.slice(index + 1),
    ]
    setProbabilities(newProbabilities)
    props.handleChange(event)

    validate(newProbabilities)
  }

  const back = () => {
    props.back()
  }

  const nextSection = (e: any) => {
    e.preventDefault()

    if (!error) {
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
    <CreateCard>
      <OutcomeInfo>
        Please add all the possible outcomes for the <strong>&quot;{question}&quot;</strong>{' '}
        question.
      </OutcomeInfo>
      <Outcomes outcomes={outcomes} onChange={handleChange} />
      <ButtonContainer>
        <ButtonLinkStyled onClick={() => back()}>‹ Back</ButtonLinkStyled>
        <Button disabled={error} onClick={(e: any) => nextSection(e)}>
          Next
        </Button>
      </ButtonContainer>
    </CreateCard>
  )
}

export { OutcomesStep }
