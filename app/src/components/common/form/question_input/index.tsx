import React, { ChangeEvent, useState } from 'react'
import styled from 'styled-components'

import { FormRowLink, Textfield } from '../..'
import { ConnectedWeb3Context } from '../../../../hooks/connectedWeb3'
import { Arbitrator, Question } from '../../../../util/types'
import { ModalQuestion } from '../../../modal'
import { FormLabel } from '../form_label'

interface Props {
  addArbitratorCustomValue: (arbitrator: Arbitrator) => void
  addCategoryCustomValue: (category: string) => void
  context: ConnectedWeb3Context
  disabled: boolean
  name: string
  onChange: (event: ChangeEvent<HTMLInputElement>) => any
  onChangeQuestion: (question: Question, arbitrator: Arbitrator) => any
  onClearQuestion: () => void
  placeholder: string
  value: string
}

const TitleWrapper = styled.div`
  align-items: center;
  display: flex;
  justify-content: space-between;
  margin-bottom: 12px;
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
      <TitleWrapper>
        <FormLabel>Set Market Question</FormLabel>
        {!disabled && <FormRowLink onClick={() => setModalQuestionState(true)}>add question</FormRowLink>}
        {disabled && <FormRowLink onClick={onClearQuestion}>clear question</FormRowLink>}
      </TitleWrapper>
      <Textfield
        disabled={disabled}
        name={name}
        onChange={onChange}
        placeholder={placeholder}
        type="text"
        value={value}
      />
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
    </>
  )
}
