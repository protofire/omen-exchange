import React, { useState } from 'react'
import styled from 'styled-components'
import { CreateCard } from '../../../common/create_card'
import { Button } from '../../../common/index'
import { Outcomes, Outcome } from '../../../common/outcomes'
import { ButtonContainer } from '../../../common/button_container'
import { ButtonLink } from '../../../common/button_link'
import { Well } from '../../../common/well'
import { MAX_OUTCOME_ALLOWED } from '../../../../common/constants'
import { Textfield } from '../../../common/textfield'
import { ButtonAdd } from '../../../common/button_add'

const ButtonLinkStyled = styled(ButtonLink)`
  margin-right: auto;
`

const OutcomeInfo = styled(Well)`
  margin-bottom: 30px;
`

const ButtonContainerStyled = styled(ButtonContainer)`
  padding-top: 10px;
`

const NewOutcome = styled(Well)`
  column-gap: 15px;
  display: grid;
  grid-template-columns: 1fr 26px;
  margin-top: auto;
`

interface Props {
  back: () => void
  next: () => void
  values: {
    question: string
    outcomes: Outcome[]
  }
  handleOutcomesChange: (newOutcomes: Outcome[]) => any
}

const OutcomesStep = (props: Props) => {
  const { handleOutcomesChange, values } = props
  const { question, outcomes } = values

  const [newOutcomeName, setNewOutcomeName] = useState('')

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

  const error =
    totalProbabilities !== 100 || someEmptyName || someEmptyProbability || outcomes.length < 2

  const canAddOutcome = outcomes.length < MAX_OUTCOME_ALLOWED

  const addNewOutcome = () => {
    const newOutcome = {
      name: newOutcomeName.trim(),
      probability: 0,
    }
    outcomes.push(newOutcome)
    handleOutcomesChange(outcomes)
    setNewOutcomeName('')
  }

  return (
    <CreateCard>
      <OutcomeInfo>
        Please add all the possible outcomes for the <strong>&quot;{question}&quot;</strong>{' '}
        question.
      </OutcomeInfo>
      <Outcomes
        outcomes={outcomes}
        totalProbabilities={totalProbabilities}
        onChange={handleOutcomesChange}
        errorMessages={errorMessages}
      />
      {canAddOutcome && (
        <NewOutcome>
          <Textfield
            type="text"
            placeholder="Add new outcome"
            value={newOutcomeName}
            onChange={e => setNewOutcomeName(e.target.value)}
          />
          <ButtonAdd disabled={!newOutcomeName} onClick={addNewOutcome} />
        </NewOutcome>
      )}

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
