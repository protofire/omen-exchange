import React, { ChangeEvent } from 'react'
import styled from 'styled-components'
import { Textfield } from '../index'
import { TextfieldCustomPlaceholder } from '../textfield_custom_placeholder'
import { FormLabel } from '../form_label'
import { Tooltip } from '../tooltip'

interface Outcome {
  value: string
  name: string
  probability: string | number
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
  const outcomesToRender = props.outcomes.map((outcome: Outcome, index: number) => (
    <TwoColumnsRowExtraMargin key={index}>
      <Textfield name={`outcome_${index}`} type="text" value={outcome.value} readOnly />
      <TextfieldCustomPlaceholder
        formField={
          <TextFieldStyled
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
          <Tooltip description="The total amount of probabilites must add up to 100%" />
        </LabelWrapper>
      </TwoColumnsRow>
      {outcomesToRender}
    </>
  )
}

export { Outcomes }
