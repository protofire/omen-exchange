import React from 'react'
import styled from 'styled-components'

import { MAX_OUTCOME_ALLOWED } from '../../../../common/constants'
import { Button, ButtonContainer, ButtonLink, CreateCard, Well } from '../../../common'
import { Outcome, Outcomes } from '../../outcomes'

const ButtonLinkStyled = styled(ButtonLink)`
  margin-right: auto;
`

const OutcomeInfo = styled(Well)`
  margin-bottom: 30px;
`

const ButtonContainerStyled = styled(ButtonContainer)`
  padding-top: 10px;
`

interface Props {
  back: () => void
  next: () => void
  values: {
    question: string
    outcomes: Outcome[]
    loadedQuestionId: Maybe<string>
  }
  handleOutcomesChange: (newOutcomes: Outcome[]) => any
}

const OutcomesStep = (props: Props) => {
  const { handleOutcomesChange, values } = props
  const { loadedQuestionId, outcomes, question } = values

  const errorMessages = []

  const someEmptyName = outcomes.some(outcome => !outcome.name)
  if (someEmptyName) {
    errorMessages.push('The names of the outcomes should not be empty.')
  }

  const someEmptyProbability = outcomes.some(outcome => outcome.probability === 0)
  if (someEmptyProbability) {
    errorMessages.push('The probabilities of the outcomes should not be zero.')
  }

  const totalProbabilities = outcomes.reduce((total, cur) => total + cur.probability, 0)
  if (totalProbabilities !== 100) {
    errorMessages.push('The sum of all probabilities must be equal to 100%.')
  }

  if (outcomes.length < 2) {
    errorMessages.push('Please enter at least 2 outcomes')
  }

  const error = totalProbabilities !== 100 || someEmptyName || someEmptyProbability || outcomes.length < 2

  const canAddOutcome = outcomes.length < MAX_OUTCOME_ALLOWED && !loadedQuestionId

  return (
    <CreateCard>
      <OutcomeInfo>
        Please add all the possible outcomes for the <strong>&quot;{question}&quot;</strong> question.
      </OutcomeInfo>
      <Outcomes
        canAddOutcome={canAddOutcome}
        disabled={!!loadedQuestionId}
        errorMessages={errorMessages}
        onChange={handleOutcomesChange}
        outcomes={outcomes}
        totalProbabilities={totalProbabilities}
      />

      <ButtonContainerStyled>
        <ButtonLinkStyled onClick={props.back}>‹ Back</ButtonLinkStyled>
        <Button disabled={error} onClick={props.next}>
          Next
        </Button>
      </ButtonContainerStyled>
    </CreateCard>
  )
}

export { OutcomesStep }
