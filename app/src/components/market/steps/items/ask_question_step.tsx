import React, { ChangeEvent } from 'react'
import styled from 'styled-components'

import { CreateCard } from '../../../common/create_card'
import { Button, Categories } from '../../../common/index'
import { FormRow } from '../../../common/form_row'
import { DateField } from '../../../common/date_field'
import { ButtonContainer } from '../../../common/button_container'
import { Well } from '../../../common/well'
import { Arbitrators } from '../../../common/arbitrators'
import { QuestionInput } from '../../../common/question_input'
import { useConnectedWeb3Context } from '../../../../hooks/connectedWeb3'
import { Arbitrator, Question } from '../../../../util/types'
import { DisplayArbitrator } from '../../../common/display_arbitrator'

interface Props {
  next: () => void
  values: {
    question: string
    category: string
    categoriesCustom: string[]
    resolution: Date | null
    arbitrator: Arbitrator
    arbitratorsCustom: Arbitrator[]
    loadedQuestion: string
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
    values,
    handleChange,
    handleClearQuestion,
    handleQuestionChange,
    handleArbitratorChange,
    handleDateChange,
    addArbitratorCustom,
    addCategoryCustom,
    next,
  } = props
  const {
    question,
    category,
    categoriesCustom,
    resolution,
    arbitrator,
    arbitratorsCustom,
    loadedQuestion,
  } = values

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
            value={question}
            name="question"
            onChange={handleChange}
            onChangeQuestion={handleQuestionChange}
            onClearQuestion={handleClearQuestion}
            addArbitratorCustomValue={addArbitratorCustom}
            addCategoryCustomValue={addCategoryCustom}
            placeholder="Type in a question..."
            context={context}
            disabled={!!loadedQuestion}
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
            name="category"
            disabled={!!loadedQuestion}
            value={category}
            onChange={handleChange}
            customValues={categoriesCustom}
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
            disabled={!!loadedQuestion}
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
            disabled={!!loadedQuestion}
            name="arbitrator"
            value={arbitrator}
            onChangeArbitrator={handleArbitratorChange}
            customValues={arbitratorsCustom}
            networkId={context.networkId}
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
