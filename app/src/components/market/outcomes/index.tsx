import React, { useState } from 'react'
import styled, { css } from 'styled-components'

import { ButtonCircle } from '../../button'
import { FormError, FormLabel, FormRowLink, Textfield, TextfieldCustomPlaceholder, Tooltip } from '../../common'
import { AddIcon, RemoveIcon } from '../../common/icons'

const BUTTON_DIMENSIONS = '34px'

const OutcomeGridCSS = css`
  align-items: center;
  column-gap: 20px;
  display: grid;
`

const OutcomeIsUniformGridCSS = css`
  ${OutcomeGridCSS}
  grid-template-columns: 1fr ${BUTTON_DIMENSIONS};
`

const OutcomeIsManualGridCSS = css`
  ${OutcomeGridCSS}
  grid-template-columns: 1fr 146px ${BUTTON_DIMENSIONS};
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

const OutcomesWrapper = styled.div`
  border-top: 1px solid ${props => props.theme.borders.borderColor};
  display: flex;
  flex-direction: column;
  flex-grow: 1;
`

const OutcomesTitles = styled.div`
  column-gap: 12px;
  display: grid;
  grid-template-columns: 2fr 1fr ${BUTTON_DIMENSIONS};
  margin-bottom: 12px;
`

const OutcomeItems = styled.div`
  max-height: 200px;
  overflow: auto;
`

const OutcomeItem = styled(OutcomesTitles)`
  margin-bottom: 20px;

  &:last-child {
    margin-bottom: 0;
  }
`

const FormLabelWrapper = styled.div`
  align-items: center;
  display: flex;
  justify-content: space-between;
`

const ErrorsWrapper = styled.div`
  margin: auto 0 0 0;
  padding: 10px 0 0 0;
`

const ErrorStyled = styled(FormError)`
  margin: 0 0 10px 0;
`

const TotalWrapper = styled(OutcomesTitles)`
  margin-top: auto;
`

const TotalText = styled.div`
  color: ${props => props.theme.colors.textColor};
  display: inline;
  font-size: 12px;
  line-height: 1.2;
  margin: 0;
`

const TotalTitle = styled(TotalText)`
  padding-left: 15px;
`

const TotalValue = styled(TotalText)`
  font-weight: 600;
  text-align: right;
`

const TotalValueColor = styled(TotalText)<{ error?: boolean; uniformProbabilities: boolean }>`
  color: ${props =>
    props.error
      ? props.theme.colors.error
      : props.uniformProbabilities
      ? props.theme.colors.primary
      : props.theme.colors.textColor};
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
  const { canAddOutcome, disabled, errorMessages, outcomes, totalProbabilities } = props
  const [newOutcomeName, setNewOutcomeName] = useState('')
  const [newOutcomeProbability, setNewOutcomeProbability] = useState(0)
  const [uniformProbabilities, setIsUniform] = useState(false)

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
      <ErrorsWrapper>
        {errorMessages.map((errorMessage, index) => (
          <ErrorStyled data-testid={`outcome_error_message_${index}`} key={index}>
            {errorMessage}
          </ErrorStyled>
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
    <OutcomeItem key={index}>
      <Textfield
        disabled={disabled}
        name={`outcome_${index}`}
        onChange={e => updateOutcomeName(index, e.currentTarget.value)}
        type="text"
        value={outcome.name}
      />
      <TextfieldCustomPlaceholder
        formField={
          <Textfield
            data-testid={`outcome_${index}`}
            disabled={uniformProbabilities}
            min={0}
            onChange={e => updateOutcomeProbability(index, +e.currentTarget.value)}
            type="number"
            value={outcome.probability}
          />
        }
        placeholderText="%"
      />
      <CustomButtonCircle
        disabled={disabled}
        onClick={() => {
          removeOutcome(index)
        }}
      >
        <RemoveIcon />
      </CustomButtonCircle>
    </OutcomeItem>
  ))

  const manualProbabilities = !uniformProbabilities
  const manualProbabilitiesAndThereAreOutcomes = manualProbabilities && outcomes.length > 0
  const manualProbabilitiesAndNoOutcomes = manualProbabilities && outcomes.length === 0

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
          disabled={!canAddOutcome}
          onChange={e => setNewOutcomeName(e.target.value)}
          placeholder="Add new outcome"
          type="text"
          value={newOutcomeName}
        />
        {!uniformProbabilities && (
          <TextfieldCustomPlaceholder
            formField={
              <Textfield
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
        <CustomButtonCircleAdd disabled={!newOutcomeName} onClick={addNewOutcome} readyToAdd={newOutcomeName !== ''}>
          <AddIcon />
        </CustomButtonCircleAdd>
      </NewOutcome>
      <OutcomesWrapper>
        <OutcomesTitles>
          <FormLabel>Outcome</FormLabel>
          <FormLabelWrapper>
            <FormLabel>Probability</FormLabel>
            <Tooltip
              description="If an event has already a probability different than 50-50 you can adjust it here. It is important that the probabilities add up to 100%"
              id="probability"
            />
          </FormLabelWrapper>
        </OutcomesTitles>
        <OutcomeItems>{outcomesToRender}</OutcomeItems>
        {messageErrorToRender()}
        <TotalWrapper>
          <TotalTitle>
            <strong>Total:</strong> {outcomes.length} outcomes
          </TotalTitle>
          <TotalValue>
            <TotalValueColor error={totalProbabilities !== 100} uniformProbabilities={uniformProbabilities}>
              {totalProbabilities}
            </TotalValueColor>
            %
          </TotalValue>
        </TotalWrapper>
      </OutcomesWrapper>
    </>
  )
}

export { Outcomes }
