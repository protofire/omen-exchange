import React, { ChangeEvent } from 'react'
import styled from 'styled-components'

import { useConnectedWeb3Context } from '../../../../hooks/connectedWeb3'
import { Arbitrator, Question } from '../../../../util/types'
import {
  Arbitrators,
  Button,
  ButtonContainer,
  Categories,
  CreateCard,
  DateField,
  DisplayArbitrator,
  FormRow,
  Well,
} from '../../../common'
import { QuestionInput } from '../../../common/question_input'

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
  }
  handleChange: (event: ChangeEvent<HTMLInputElement> | ChangeEvent<HTMLSelectElement>) => any
  handleDateChange: (date: Date | null) => any
  handleQuestionChange: (question: Question, arbitrator: Arbitrator) => any
  handleArbitratorChange: (arbitrator: Arbitrator) => any
  handleClearQuestion: () => any
  addArbitratorCustom: (arbitrator: Arbitrator) => void
  addCategoryCustom: (category: string) => void
}

const OracleInfo = styled(Well)`
  font-style: italic;
  text-align: center;
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
    handleQuestionChange,
    next,
    values,
  } = props
  const { arbitrator, arbitratorsCustom, categoriesCustom, category, loadedQuestionId, question, resolution } = values

  const error = !question || !category || !resolution

  const validate = (e: any) => {
    e.preventDefault()

    if (!error) {
      next()
    }
  }

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
        title={'Question'}
        tooltip={{
          id: `question`,
          description: `Ensure that your market is phrased in a way that it can be unambiguous, resolvable, contains all the necessary parameters and is clearly understandable. As a guide you could use the <a target="_blank" href="https://augur.guide/2-market-creators/checksheet.html">check sheet</a> prepared by Augur for creating markets.`,
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
        tooltip={{
          id: `arbitrator`,
          description: `If you want to learn how <a target="_blank" href="https://realit.io">realit.io</a> and <a target="_blank" href="https://kleros.io">Kleros</a> work, please visit their websites.
`,
        }}
      />
      <OracleInfo>
        <DisplayArbitrator arbitrator={arbitrator} />
      </OracleInfo>
      <ButtonContainer>
        <Button disabled={error} onClick={validate}>
          Next
        </Button>
      </ButtonContainer>
    </CreateCard>
  )
}

export { AskQuestionStep }
