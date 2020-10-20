import React, { ChangeEvent } from 'react'
import styled from 'styled-components'

import { ConnectedWeb3Context } from '../../../../../../hooks'
import { FormRow, Textfield } from '../../../../../common'
import { QuestionInput } from '../../../../../common/form/question_input'

interface Props {
  context: ConnectedWeb3Context
  handleChange: (event: ChangeEvent<HTMLInputElement> | ChangeEvent<HTMLSelectElement>) => any
  question: string
  lowerBound: string
  upperBound: string
  startingPoint: string
  unit: string
}

export const CreateScalarMarket = (props: Props) => {
  const { context, handleChange, lowerBound, question, startingPoint, unit, upperBound } = props

  return (
    <>
      <FormRow
        formField={
          <QuestionInput
            context={context}
            disabled={false}
            name="question"
            onChange={handleChange}
            placeholder="What question do you want the world predict?"
            value={question}
          />
        }
      />
      <FormRow
        formField={<Textfield onChange={handleChange} placeholder="0" value={lowerBound} />}
        title={'Lower Bound'}
      />
      <FormRow
        formField={<Textfield onChange={handleChange} placeholder="1000" value={upperBound} />}
        title={'Upper Bound'}
      />
      <FormRow
        formField={<Textfield onChange={handleChange} placeholder="500" value={startingPoint} />}
        title={'Starting Point'}
      />
      <FormRow
        formField={<Textfield onChange={handleChange} placeholder="Ether" value={unit} />}
        title={'Unit of measurement'}
      />
    </>
  )
}
