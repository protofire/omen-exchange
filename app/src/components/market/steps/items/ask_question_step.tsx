import React, { ChangeEvent } from 'react'
import { useHistory } from 'react-router'
import styled from 'styled-components'

import { MAX_OUTCOME_ALLOWED } from '../../../../common/constants'
import { useConnectedWeb3Context } from '../../../../hooks/connectedWeb3'
import { Arbitrator, Question } from '../../../../util/types'
import { Button, ButtonContainer } from '../../../button'
import { ButtonType } from '../../../button/button_styling_types'
import { Arbitrators, Categories, CreateCard, DateField, FormRow } from '../../../common'
import { QuestionInput } from '../../../common/question_input'
import { Outcome, Outcomes } from '../../outcomes'

const LeftButton = styled(Button)`
  margin-right: auto;
`

const GridThreeColumns = styled.div`
  border-top: 1px solid ${props => props.theme.borders.borderColor};
  column-gap: 20px;
  display: grid;
  grid-template-columns: 1fr;
  padding: 20px 25px;
  row-gap: 20px;

  @media (min-width: ${props => props.theme.themeBreakPoints.md}) {
    grid-template-columns: 1fr 1fr 1fr;
  }
`

const Column = styled.div`
  @media (min-width: ${props => props.theme.themeBreakPoints.md}) {
    max-width: 165px;
  }
`

interface Props {
  next: () => void
  values: {
    question: string
    category: string
    categoriesCustom: string[]
    resolution: Date | null
    arbitrator: Arbitrator
    arbitratorsCustom: Arbitrator[]
    loadedQuestionId: Maybe<string>
    outcomes: Outcome[]
  }
  addArbitratorCustom: (arbitrator: Arbitrator) => void
  addCategoryCustom: (category: string) => void
  handleArbitratorChange: (arbitrator: Arbitrator) => any
  handleChange: (event: ChangeEvent<HTMLInputElement> | ChangeEvent<HTMLSelectElement>) => any
  handleClearQuestion: () => any
  handleDateChange: (date: Date | null) => any
  handleOutcomesChange: (newOutcomes: Outcome[]) => any
  handleQuestionChange: (question: Question, arbitrator: Arbitrator) => any
}

const AskQuestionStep = (props: Props) => {
  const context = useConnectedWeb3Context()

  const {
    addArbitratorCustom,
    addCategoryCustom,
    handleArbitratorChange,
    handleChange,
    handleClearQuestion,
    handleDateChange,
    handleOutcomesChange,
    handleQuestionChange,
    values,
  } = props

  const {
    arbitrator,
    arbitratorsCustom,
    categoriesCustom,
    category,
    loadedQuestionId,
    outcomes,
    question,
    resolution,
  } = values

  const history = useHistory()

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
    totalProbabilities !== 100 ||
    someEmptyName ||
    someEmptyProbability ||
    outcomes.length < 2 ||
    !question ||
    !category ||
    !resolution

  const canAddOutcome = outcomes.length < MAX_OUTCOME_ALLOWED && !loadedQuestionId

  return (
    <CreateCard>
      <FormRow
        formField={
          <QuestionInput
            addArbitratorCustomValue={addArbitratorCustom}
            addCategoryCustomValue={addCategoryCustom}
            context={context}
            disabled={!!loadedQuestionId}
            name="question"
            onChange={handleChange}
            onChangeQuestion={handleQuestionChange}
            onClearQuestion={handleClearQuestion}
            placeholder="What question do you want the world predict?"
            value={question}
          />
        }
        title={'Set Market Question'}
      />
      <Outcomes
        canAddOutcome={canAddOutcome}
        disabled={!!loadedQuestionId}
        errorMessages={errorMessages}
        onChange={handleOutcomesChange}
        outcomes={outcomes}
        totalProbabilities={totalProbabilities}
      />

      <GridThreeColumns>
        <Column>
          <FormRow
            formField={
              <DateField
                disabled={!!loadedQuestionId}
                minDate={new Date()}
                name="resolution"
                onChange={handleDateChange}
                selected={resolution}
              />
            }
            title={'Resolution Date'}
          />
        </Column>
        <Column>
          <FormRow
            formField={
              <Categories
                customValues={categoriesCustom}
                disabled={!!loadedQuestionId}
                name="category"
                onChange={handleChange}
                value={category}
              />
            }
            title={'Category'}
          />
        </Column>
        <Column>
          <FormRow
            formField={
              <Arbitrators
                customValues={arbitratorsCustom}
                disabled={!!loadedQuestionId}
                name="arbitrator"
                networkId={context.networkId}
                onChangeArbitrator={handleArbitratorChange}
                value={arbitrator}
              />
            }
            title={'Arbitrator'}
          />
        </Column>
      </GridThreeColumns>
      <ButtonContainer>
        <LeftButton buttonType={ButtonType.secondaryLine} onClick={() => history.push(`/`)}>
          Cancel
        </LeftButton>
        <Button buttonType={ButtonType.secondaryLine} disabled={error} onClick={props.next}>
          Next
        </Button>
      </ButtonContainer>
    </CreateCard>
  )
}

export { AskQuestionStep }
