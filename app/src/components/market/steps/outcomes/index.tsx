import React, { useState } from 'react'
import styled, { css } from 'styled-components'

import { ButtonCircle } from '../../../button'
import { FormError, FormLabel, FormRowLink, Textfield, TextfieldCustomPlaceholder } from '../../../common'
import { AddIcon, RemoveIcon } from '../../../common/icons'
import {
  ErrorsWrapper,
  OutcomeItemLittleBallOfJoyAndDifferentColors,
  OutcomeItemProbability,
  OutcomeItemProbabilityText,
  OutcomeItemText,
  OutcomeItemTextWrapper,
  OutcomesTBody,
  OutcomesTD,
  OutcomesTH,
  OutcomesTHead,
  OutcomesTR,
  OutcomesTable,
  OutcomesTableWrapper,
} from '../common_styled'

const BUTTON_DIMENSIONS = '34px'

const OutcomeGridCSS = css`
  align-items: center;
  column-gap: 16px;
  display: grid;
`

const OutcomeIsUniformGridCSS = css`
  ${OutcomeGridCSS}
  grid-template-columns: 1fr ${BUTTON_DIMENSIONS};
`

const OutcomeIsManualGridCSS = css`
  ${OutcomeGridCSS}
  grid-template-columns: minmax(120px, 1fr) minmax(100px, 146px) ${BUTTON_DIMENSIONS};
`

const TitleWrapper = styled.div<{ uniformProbabilities: boolean }>`
  ${props => props.uniformProbabilities && OutcomeIsUniformGridCSS}
  ${props => !props.uniformProbabilities && OutcomeIsManualGridCSS}
  margin-bottom: 12px;
`

const TitleText = styled.div`
  direction: rtl;
  text-align: right;
  white-space: nowrap;
`

const NewOutcome = styled.div<{ uniformProbabilities: boolean }>`
  ${props => props.uniformProbabilities && OutcomeIsUniformGridCSS}
  ${props => !props.uniformProbabilities && OutcomeIsManualGridCSS}
  margin-bottom: 20px;
`

const CustomButtonCircle = styled(ButtonCircle)`
  &,
  &[disabled] {
    border-color: ${props => props.theme.borders.borderColorLighter};
  }

  height: ${BUTTON_DIMENSIONS};
  width: ${BUTTON_DIMENSIONS};
`

const CustomButtonCircleAddReadyCSS = css`
  background-color: ${props => props.theme.colors.primary};
  border-color: ${props => props.theme.colors.primary};

  path {
    fill: #fff;
  }
`

const CustomButtonCircleAdd = styled(CustomButtonCircle)<{ readyToAdd: boolean }>`
  ${props => props.readyToAdd && CustomButtonCircleAddReadyCSS}
`

export interface Outcome {
  name: string
  probability: number
}

interface Props {
  canAddOutcome: boolean
  disabled: boolean
  errorMessages?: string[]
  onChange: (newOutcomes: Outcome[]) => any
  outcomes: Outcome[]
  totalProbabilities: number
}

const Outcomes = (props: Props) => {
  const { canAddOutcome, disabled, errorMessages, outcomes } = props
  const [newOutcomeName, setNewOutcomeName] = useState('')
  const [newOutcomeProbability, setNewOutcomeProbability] = useState(0)
  const [uniformProbabilities, setIsUniform] = useState(false)

  // NOTE: Error handling is kind of icky, we should fix this
  const messageErrorToRender = () => {
    if (!errorMessages || outcomes.length === 0) {
      return
    }

    return (
      <ErrorsWrapper>
        {errorMessages.map((errorMessage, index) => (
          <FormError data-testid={`outcome_error_message_${index}`} key={index}>
            {errorMessage}
          </FormError>
        ))}
      </ErrorsWrapper>
    )
  }

  const uniform = (outcomes: Outcome[]): Outcome[] => {
    return outcomes.map(o => ({
      ...o,
      probability: 100 / outcomes.length,
    }))
  }

  const addNewOutcome = () => {
    const newOutcome = {
      name: newOutcomeName.trim(),
      probability: newOutcomeProbability,
    }
    const newOutcomes = outcomes.concat(newOutcome)
    props.onChange(uniformProbabilities ? uniform(newOutcomes) : newOutcomes)
    setNewOutcomeName('')
    setNewOutcomeProbability(0)
  }

  const removeOutcome = (index: number) => {
    outcomes.splice(index, 1)
    props.onChange(uniformProbabilities ? uniform(outcomes) : outcomes)
  }

  const handleIsUniformChanged = () => {
    setIsUniform(value => !value)
    props.onChange(!uniformProbabilities ? uniform(outcomes) : outcomes)
  }

  const setMax = () => {
    const sum = outcomes.reduce((acum, b) => acum + b.probability, 0)
    setNewOutcomeProbability(100 - sum)
  }

  const outcomesToRender = props.outcomes.map((outcome: Outcome, index: number) => (
    <OutcomesTR key={index}>
      <OutcomesTD>
        <OutcomeItemTextWrapper>
          <OutcomeItemLittleBallOfJoyAndDifferentColors outcomeIndex={index} />
          <OutcomeItemText>{outcome.name}</OutcomeItemText>
        </OutcomeItemTextWrapper>
      </OutcomesTD>
      <OutcomesTD>
        <OutcomeItemProbability>
          <OutcomeItemProbabilityText>{outcome.probability}%</OutcomeItemProbabilityText>
          <CustomButtonCircle
            disabled={disabled}
            onClick={() => {
              removeOutcome(index)
            }}
          >
            <RemoveIcon />
          </CustomButtonCircle>
        </OutcomeItemProbability>
      </OutcomesTD>
    </OutcomesTR>
  ))

  const manualProbabilities = !uniformProbabilities
  const manualProbabilitiesAndThereAreOutcomes = manualProbabilities && outcomes.length > 0
  const manualProbabilitiesAndNoOutcomes = manualProbabilities && outcomes.length === 0
  const maxOutcomesReached = outcomes.length >= 6

  return (
    <>
      <TitleWrapper uniformProbabilities={uniformProbabilities}>
        <FormLabel>Add Outcome</FormLabel>
        {manualProbabilities && <FormLabel>Probability</FormLabel>}
        {manualProbabilitiesAndNoOutcomes && (
          <TitleText>
            <FormRowLink onClick={handleIsUniformChanged}>set uniformly</FormRowLink>
          </TitleText>
        )}
        {manualProbabilitiesAndThereAreOutcomes && (
          <TitleText>
            <FormRowLink onClick={setMax}>set max</FormRowLink>
          </TitleText>
        )}
        {uniformProbabilities && (
          <TitleText>
            <FormRowLink onClick={handleIsUniformChanged}>set manual probability</FormRowLink>
          </TitleText>
        )}
      </TitleWrapper>
      <NewOutcome uniformProbabilities={uniformProbabilities}>
        <Textfield
          disabled={!canAddOutcome || maxOutcomesReached}
          onChange={e => setNewOutcomeName(e.target.value)}
          placeholder="Add new outcome"
          type="text"
          value={newOutcomeName}
        />
        {!uniformProbabilities && (
          <TextfieldCustomPlaceholder
            formField={
              <Textfield
                disabled={maxOutcomesReached}
                min={0}
                onChange={e => setNewOutcomeProbability(Number(e.target.value))}
                placeholder="0.00"
                type="number"
                value={newOutcomeProbability ? newOutcomeProbability : ''}
              />
            }
            placeholderText="%"
          />
        )}
        <CustomButtonCircleAdd
          disabled={!newOutcomeName || maxOutcomesReached}
          onClick={addNewOutcome}
          readyToAdd={newOutcomeName !== ''}
        >
          <AddIcon />
        </CustomButtonCircleAdd>
      </NewOutcome>
      <OutcomesTableWrapper>
        <OutcomesTable>
          <OutcomesTHead>
            <OutcomesTR>
              <OutcomesTH style={{ width: '70%' }}>Outcome</OutcomesTH>
              <OutcomesTH>Probability</OutcomesTH>
            </OutcomesTR>
          </OutcomesTHead>
          <OutcomesTBody>{outcomesToRender}</OutcomesTBody>
        </OutcomesTable>
      </OutcomesTableWrapper>
      {messageErrorToRender()}
      {/* <TotalWrapper>
        <TotalTitle>
          <strong>Total:</strong> {outcomes.length} outcomes
        </TotalTitle>
        <TotalValue>
          <TotalValueColor error={totalProbabilities !== 100} uniformProbabilities={uniformProbabilities}>
            {totalProbabilities}
          </TotalValueColor>
          %
        </TotalValue>
      </TotalWrapper> */}
    </>
  )
}

export { Outcomes }
