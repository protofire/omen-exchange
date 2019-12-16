import React from 'react'
import styled from 'styled-components'
import { Textfield } from '../index'
import { TextfieldCustomPlaceholder } from '../textfield_custom_placeholder'
import { FormLabel } from '../form_label'
import { Tooltip } from '../tooltip'

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

const ErrorStyled = styled.p`
  color: red;
  font-weight: 500;
  font-size: 12px;
  font-weight: normal;
  line-height: 1.45;
  margin: 0 0 15px 0;
  text-align: left;
`

export interface Outcome {
  name: string
  probability: number
}

interface Props {
  outcomes: Outcome[]
  onChange: (newOutcomes: Outcome[]) => any
  errorMessages?: string[]
}

const Outcomes = (props: Props) => {
  const { outcomes, errorMessages } = props

  const updateOutcomeProbability = (index: number, newProbability: number) => {
    if (newProbability < 0 || newProbability > 100) {
      return
    }

    // for binary markets, change the probability of the other outcome so that they add to 100
    if (outcomes.length === 2) {
      const otherProbability = 100 - newProbability

      const newOutcomes = [
        {
          ...outcomes[0],
          probability: index === 0 ? newProbability : otherProbability,
        },
        {
          ...outcomes[1],
          probability: index === 0 ? otherProbability : newProbability,
        },
      ]

      props.onChange(newOutcomes)
    } else {
      const newOutcome = {
        ...outcomes[index],
        probability: newProbability,
      }

      const newOutcomes = [...outcomes.slice(0, index), newOutcome, ...outcomes.slice(index + 1)]
      props.onChange(newOutcomes)
    }
  }

  const updateOutcomeName = (index: number, newName: string) => {
    const newOutcome = {
      ...outcomes[index],
      name: newName,
    }

    const newOutcomes = [...outcomes.slice(0, index), newOutcome, ...outcomes.slice(index + 1)]
    props.onChange(newOutcomes)
  }

  const messageErrorToRender = () => {
    if (!errorMessages) {
      return
    }

    return (
      <>
        {errorMessages.map((errorMessage, index) => (
          <ErrorStyled data-testid={`outcome_error_message_${index}`} key={index}>
            {errorMessage}
          </ErrorStyled>
        ))}
      </>
    )
  }

  const outcomesToRender = props.outcomes.map((outcome: Outcome, index: number) => (
    <TwoColumnsRowExtraMargin key={index}>
      <Textfield
        name={`outcome_${index}`}
        type="text"
        value={outcome.name}
        onChange={e => updateOutcomeName(index, e.currentTarget.value)}
      />
      <TextfieldCustomPlaceholder
        formField={
          <TextFieldStyled
            data-testid={`outcome_${index}`}
            min={0}
            onChange={e => updateOutcomeProbability(index, +e.currentTarget.value)}
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
      {messageErrorToRender()}
    </>
  )
}

export { Outcomes }
