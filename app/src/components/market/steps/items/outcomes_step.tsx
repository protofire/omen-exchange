import React from 'react'
import styled from 'styled-components'
import { CreateCard } from '../../../common/create_card'
import { Button } from '../../../common/index'
import { Outcomes, Outcome } from '../../../common/outcomes'
import { ButtonContainer } from '../../../common/button_container'
import { ButtonLink } from '../../../common/button_link'
import { Well } from '../../../common/well'
import { MAX_OUTCOME_ALLOWED } from '../../../../common/constants'

const ButtonLinkStyled = styled(ButtonLink)`
  margin-right: auto;
`

const OutcomeInfo = styled(Well)`
  margin-bottom: 30px;
`

const ButtonContainerStyled = styled(ButtonContainer)`
  display: grid;
  grid-row-gap: 10px;
  grid-template-columns: 1fr;

  > button {
    margin-left: 0;
  }

  @media (min-width: ${props => props.theme.themeBreakPoints.md}) {
    display: flex;

    > button {
      margin-left: 10px;
    }
  }
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

  const someEmptyName = outcomes.some(outcome => !outcome.name)

  const messageOutcomeEmptyNamesError = someEmptyName
    ? 'The names of the outcomes should not be empty.'
    : ''

  const totalOutcomeProbabilities = outcomes.reduce((prev, cur) => prev + cur.probability, 0)
  const messageOutcomeProbabilitiesError =
    totalOutcomeProbabilities !== 100 ? 'The sum of all probabilities must be equal to 100%.' : ''

  const error = totalOutcomeProbabilities !== 100 || someEmptyName

  const isAddNewOutcomeButtonDisabled = outcomes.length >= MAX_OUTCOME_ALLOWED

  const addNewOutcome = () => {
    const newOutcome = {
      name: '',
      probability: 0,
    }
    outcomes.push(newOutcome)
    handleOutcomesChange(outcomes)
  }

  return (
    <CreateCard>
      <OutcomeInfo>
        Please add all the possible outcomes for the <strong>&quot;{question}&quot;</strong>{' '}
        question.
      </OutcomeInfo>
      <Outcomes
        outcomes={outcomes}
        onChange={handleOutcomesChange}
        messageEmptyNamesError={messageOutcomeEmptyNamesError}
        messageProbabilitiesError={messageOutcomeProbabilitiesError}
      />
      <ButtonContainerStyled>
        <ButtonLinkStyled onClick={props.back}>‹ Back</ButtonLinkStyled>
        <Button disabled={isAddNewOutcomeButtonDisabled} fontSize={'17px'} onClick={addNewOutcome}>
          Add outcome
        </Button>
        <Button disabled={error} onClick={props.next}>
          Next
        </Button>
      </ButtonContainerStyled>
    </CreateCard>
  )
}

export { OutcomesStep }
