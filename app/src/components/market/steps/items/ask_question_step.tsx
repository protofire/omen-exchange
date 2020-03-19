import React, { ChangeEvent } from 'react'
import { useHistory } from 'react-router'
import styled from 'styled-components'

import { MAX_OUTCOME_ALLOWED } from '../../../../common/constants'
import { useConnectedWeb3Context } from '../../../../hooks/connectedWeb3'
import { Arbitrator, Question } from '../../../../util/types'
import { Button, ButtonContainer } from '../../../button'
import { ButtonType } from '../../../button/button_styling_types'
import { Arbitrators, Categories, CreateCard, DateField, DisplayArbitrator, FormRow, Well } from '../../../common'
import { QuestionInput } from '../../../common/question_input'
import { Outcome, Outcomes } from '../../outcomes'

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
  handleChange: (event: ChangeEvent<HTMLInputElement> | ChangeEvent<HTMLSelectElement>) => any
  handleDateChange: (date: Date | null) => any
  handleQuestionChange: (question: Question, arbitrator: Arbitrator) => any
  handleArbitratorChange: (arbitrator: Arbitrator) => any
  handleOutcomesChange: (newOutcomes: Outcome[]) => any
  handleClearQuestion: () => any
  addArbitratorCustom: (arbitrator: Arbitrator) => void
  addCategoryCustom: (category: string) => void
}

const OracleInfo = styled(Well)`
  font-style: italic;
  text-align: center;
`

const LeftButton = styled(Button)`
  margin-right: auto;
`

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
      <OracleInfo>
        <DisplayArbitrator arbitrator={arbitrator} />
      </OracleInfo>
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
