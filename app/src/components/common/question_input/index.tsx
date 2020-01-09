import React, { ChangeEvent, useState } from 'react'
import styled from 'styled-components'

import { ModalQuestion } from './modal_question'
import { Arbitrator, Question } from '../../../util/types'
import { ConnectedWeb3Context } from '../../../hooks/connectedWeb3'
import { FormRowLink } from '../form_row_link'
import { Textfield } from '../textfield'

interface Props {
  defaultValue: string
  name: string
  onChange: (event: ChangeEvent<HTMLInputElement>) => any
  onChangeFromRealitio: (question: Question, arbitrator: Arbitrator) => any
  onClearQuestionFromRealitio: () => void
  placeholder: string
  context: ConnectedWeb3Context
  disabled: boolean
  addArbitratorCustomValue: (arbitrator: Arbitrator) => void
  addCategoryCustomValue: (category: string) => void
}

const Link = styled(FormRowLink)`
  display: block;
  margin-top: 5px;
  margin-left: auto;
`

export const QuestionInput = (props: Props) => {
  const {
    defaultValue,
    name = 'question',
    onChange,
    onChangeFromRealitio,
    onClearQuestionFromRealitio,
    placeholder = 'Type in a question...',
    context,
    disabled,
    addArbitratorCustomValue,
    addCategoryCustomValue,
  } = props

  const [isModalQuestionOpen, setModalQuestionState] = useState(false)

  return (
    <>
      <Textfield
        defaultValue={defaultValue}
        name={name}
        onChange={onChange}
        placeholder={placeholder}
        disabled={disabled}
        type="text"
      />
      {!disabled && <Link onClick={() => setModalQuestionState(true)}>Add question</Link>}
      {disabled && <Link onClick={onClearQuestionFromRealitio}>Clear question</Link>}
      <ModalQuestion
        context={context}
        isOpen={isModalQuestionOpen}
        onClose={() => setModalQuestionState(false)}
        onSave={(question: Question, arbitrator: Arbitrator) => {
          addArbitratorCustomValue(arbitrator)
          addCategoryCustomValue(question.category)
          onChangeFromRealitio(question, arbitrator)
        }}
      />
    </>
  )
}
