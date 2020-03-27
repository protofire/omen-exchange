import React, { ChangeEvent } from 'react'
import { useHistory } from 'react-router'
import styled from 'styled-components'

import { IS_CORONA_VERSION, MAX_OUTCOME_ALLOWED } from '../../../../common/constants'
import { useConnectedWeb3Context } from '../../../../hooks/connectedWeb3'
import { Arbitrator, Question } from '../../../../util/types'
import { Button, ButtonContainer, ButtonLink } from '../../../button'
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
const ButtonLinkStyled = styled(ButtonLink)`
  margin-right: auto;
`

const ButtonContainerStyled = styled(ButtonContainer)`
  padding-top: 10px;
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
            placeholder="Type in a question..."
            value={question}
          />
        }
        title={'Set Market Question'}
        tooltip={{
          id: `question`,
          description: `Ensure that your market is phrased in a way that it can be unambiguous, resolvable, contains all the necessary parameters and is clearly understandable. As a guide you could use the <a target="_blank" href="https://augur.guide/2-market-creators/checksheet.html">check sheet</a> prepared by Augur for creating markets.`,
        }}
      />

      {/* <OutcomeInfo>
        Please add all the possible outcomes for the <strong>&quot;{question}&quot;</strong> question.
      </OutcomeInfo> */}
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
        tooltip={{
          id: `resolution`,
          description: `Precisely indicate when the market is resolved. The time is displayed in ISO 8601 format.`,
        }}
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
        tooltip={{
          id: `category`,
          description: `You can choose among several categories. Your selection will classify the subject/topic of your market.`,
        }}
      />

      <FormRow
        formField={
          <Arbitrators
            customValues={arbitratorsCustom}
            disabled={!!loadedQuestionId || IS_CORONA_VERSION}
            name="arbitrator"
            networkId={context.networkId}
            onChangeArbitrator={handleArbitratorChange}
            value={arbitrator}
          />
        }
        title={'Arbitrator'}
        tooltip={{
          id: `arbitrator`,
          description: `If you want to learn how <a target="_blank" href="https://realit.io">realit.io</a> and <a target="_blank" href="https://kleros.io">Kleros</a> work, please visit their websites.
`,
        }}
      />
      <OracleInfo>
        <DisplayArbitrator arbitrator={arbitrator} />
      </OracleInfo>
      <ButtonContainerStyled>
        <ButtonLinkStyled onClick={() => history.push(`/`)}>‹ Cancel</ButtonLinkStyled>
        <Button disabled={error} onClick={props.next}>
          Next
        </Button>
      </ButtonContainerStyled>
    </CreateCard>
  )
}

export { AskQuestionStep }
