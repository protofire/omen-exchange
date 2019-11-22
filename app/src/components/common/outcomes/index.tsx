import React, { ChangeEvent } from 'react'
import styled from 'styled-components'
import { Textfield } from '../index'
import { TextfieldCustomPlaceholder } from '../textfield_custom_placeholder'
import { FormLabel } from '../form_label'
import { Tooltip } from '../tooltip'

interface Outcome {
  name: string
  probability: string | number
  value: string
}

interface Props {
  outcomes: Outcome[]
  onChange: (index: number, event: ChangeEvent<HTMLInputElement>) => any
}

const TwoColumnsRow = styled.div`
  column-gap: 17px;
  display: grid;
  grid-template-columns: 1fr 1fr;
  margin-bottom: 12px;
`

const TwoColumnsRowExtraMargin = styled(TwoColumnsRow)`
  margin-bottom: 25px;
`

const LabelWrapper = styled.div`
  align-items: center;
  display: flex;
  justify-content: space-between;
`

const TextFieldStyled = styled(Textfield)`
  text-align: right;
`

const Outcomes = (props: Props) => {
  const outcomesToRender = props.outcomes.map((outcome, index) => (
    <TwoColumnsRowExtraMargin key={index}>
      <Textfield name={`outcome_${index}`} type="text" value={outcome.value} readOnly />
      <TextfieldCustomPlaceholder
        formField={
          <TextFieldStyled
            min={0}
            name={outcome.name}
            onChange={e => props.onChange(index, e)}
            type="number"
            value={outcome.probability}
          />
        }
        placeholderText="%"
      />
    </TwoColumnsRowExtraMargin>
  ))

  return (
    <>
      <TwoColumnsRow>
        <FormLabel>Outcome</FormLabel>
        <LabelWrapper>
          <FormLabel>Probability</FormLabel>
          <Tooltip
            id="probability"
            description="If an event has already a probability different than 50-50 you can adjust it here. It is important that the probabilities add up to 100%"
          />
        </LabelWrapper>
      </TwoColumnsRow>
      {outcomesToRender}
    </>
  )
}

export { Outcomes }
