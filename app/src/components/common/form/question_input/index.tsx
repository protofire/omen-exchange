import React, { ChangeEvent } from 'react'
import styled from 'styled-components'

import { Textfield } from '../..'
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
  isModalQuestionOpen: boolean
  setModalQuestionState: (_: boolean) => void
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
    isModalQuestionOpen,
    name = 'question',
    onChange,
    onChangeQuestion,
    placeholder = 'Type in a question...',
    setModalQuestionState,

    value,
  } = props

  return (
    <>
      <TitleWrapper>
        <FormLabel>Set Market Question</FormLabel>
      </TitleWrapper>
      <Textfield
        disabled={disabled}
        name={name}
        onChange={onChange}
        placeholder={placeholder}
        type="text"
        value={value}
      />
      {isModalQuestionOpen && (
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
      )}
    </>
  )
}
