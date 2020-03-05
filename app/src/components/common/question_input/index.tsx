import React, { ChangeEvent, useState } from 'react'
import styled from 'styled-components'

import { ConnectedWeb3Context } from '../../../hooks/connectedWeb3'
import { Arbitrator, Question } from '../../../util/types'
import { FormRowLink } from '../form_row_link'
import { FormRowNote } from '../form_row_note'
import { Textfield } from '../textfield'

import { ModalQuestion } from './modal_question'

interface Props {
  value: string
  name: string
  onChange: (event: ChangeEvent<HTMLInputElement>) => any
  onChangeQuestion: (question: Question, arbitrator: Arbitrator) => any
  onClearQuestion: () => void
  placeholder: string
  context: ConnectedWeb3Context
  disabled: boolean
  addArbitratorCustomValue: (arbitrator: Arbitrator) => void
  addCategoryCustomValue: (category: string) => void
}

const Wrapper = styled.div`
  display: flex;
  justify-content: space-between;
  margin: 0 0 5px 0;

  &:last-child {
    margin-bottom: 0;
  }
`

const Note = styled(FormRowNote)`
  margin: 5px 0 0 0;
  width: 80%;
`
const Link = styled(FormRowLink)`
  margin: 5px 0 0 0;
`

export const QuestionInput = (props: Props) => {
  const {
    addArbitratorCustomValue,
    addCategoryCustomValue,
    context,
    disabled,
    name = 'question',
    onChange,
    onChangeQuestion,
    onClearQuestion,
    placeholder = 'Type in a question...',
    value,
  } = props

  const [isModalQuestionOpen, setModalQuestionState] = useState(false)

  return (
    <>
      <Textfield
        disabled={disabled}
        name={name}
        onChange={onChange}
        placeholder={placeholder}
        type="text"
        value={value}
      />
      <Wrapper>
        <Note>
          <strong>For example:</strong> <i>&quot;Will France win?&quot;</i> is not an acceptable question, but{' '}
          <i>&quot;Will France win the 2020 FIFA World Cup?&quot;</i> is a good one.
        </Note>
        {!disabled && <Link onClick={() => setModalQuestionState(true)}>Add question</Link>}
        {disabled && <Link onClick={onClearQuestion}>Clear question</Link>}
        <ModalQuestion
          context={context}
          isOpen={isModalQuestionOpen}
          onClose={() => setModalQuestionState(false)}
          onSave={(question: Question, arbitrator: Arbitrator) => {
            addArbitratorCustomValue(arbitrator)
            addCategoryCustomValue(question.category)
            onChangeQuestion(question, arbitrator)
          }}
        />
      </Wrapper>
    </>
  )
}
