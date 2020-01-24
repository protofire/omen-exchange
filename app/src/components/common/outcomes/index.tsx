import React from 'react'
import styled from 'styled-components'
import { Textfield } from '../index'
import { TextfieldCustomPlaceholder } from '../textfield_custom_placeholder'
import { FormLabel } from '../form_label'
import { Tooltip } from '../tooltip'
import { FormError } from '../form_error'
import { Button } from '../button'
import { Well } from '../well'
import { ButtonAdd } from '../button_add'

import IconDelete from './img/delete.svg'
import { Checkbox } from '../checkbox'

const BUTTON_DIMENSIONS = '30px'

const OutcomesWrapper = styled.div`
  display: flex;
  flex-direction: column;
  flex-grow: 1;
`

const OutcomesTitles = styled.div`
  column-gap: 12px;
  display: grid;
  grid-template-columns: 2.4fr 1fr ${BUTTON_DIMENSIONS};
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

const TextFieldTextRight = styled(Textfield)`
  text-align: right;
`

const ErrorsWrapper = styled.div`
  padding: 10px 0 0 0;
  margin: auto 0 0 0;
`

const ErrorStyled = styled(FormError)`
  margin: 0 0 10px 0;
`

const CheckboxWrapper = styled.div`
  text-align: right;
`

const ButtonRemove = styled(Button)`
  background-color: transparent;
  background-image: url(${IconDelete});
  background-position: 5px 5px;
  background-repeat: no-repeat;
  border: none;
  height: ${BUTTON_DIMENSIONS};
  padding: 0;
  width: ${BUTTON_DIMENSIONS};

  &:hover {
    background-color: transparent;
  }

  &:active {
    opacity: 0.5;
  }
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

const StyledCheckbox = styled(Checkbox)`
  font-size: 12px;
  margin-right: 5px;
`

const StyledLabel = styled.label`
  color: ${props => props.theme.colors.textColor};
  display: inline;
  font-size: 12px;
  line-height: 1.2;
  margin: 0;
`

const TotalValueColor = styled(TotalText)<{ error?: boolean; isUniform: boolean }>`
  color: ${props =>
    props.error
      ? props.theme.colors.error
      : props.isUniform
      ? props.theme.colors.primary
      : props.theme.colors.textColor};
`

const NewOutcome = styled(Well)`
  column-gap: 15px;
  display: grid;
  grid-template-columns: 1fr 26px;
  margin-top: auto;
`

export interface Outcome {
  name: string
  probability: number
}

interface Props {
  outcomes: Outcome[]
  onChange: (newOutcomes: Outcome[]) => any
  errorMessages?: string[]
  totalProbabilities: number
  disabled: boolean
  canAddOutcome: boolean
}

const Outcomes = (props: Props) => {
  const { outcomes, totalProbabilities, disabled, errorMessages, canAddOutcome } = props
  const [newOutcomeName, setNewOutcomeName] = React.useState('')
  const [isUniform, setIsUniform] = React.useState(false)

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
      probability: 0,
    }
    const newOutcomes = outcomes.concat(newOutcome)
    props.onChange(isUniform ? uniform(newOutcomes) : newOutcomes)
    setNewOutcomeName('')
  }

  const removeOutcome = (index: number) => {
    outcomes.splice(index, 1)
    props.onChange(isUniform ? uniform(outcomes) : outcomes)
  }

  const handleIsUniformChanged = (event: any) => {
    const value = event.target.checked
    props.onChange(value ? uniform(outcomes) : outcomes)
    setIsUniform(value)
  }

  const outcomesToRender = props.outcomes.map((outcome: Outcome, index: number) => (
    <OutcomeItem key={index}>
      <Textfield
        name={`outcome_${index}`}
        type="text"
        value={outcome.name}
        onChange={e => updateOutcomeName(index, e.currentTarget.value)}
        disabled={disabled}
      />
      <TextfieldCustomPlaceholder
        formField={
          <TextFieldTextRight
            data-testid={`outcome_${index}`}
            min={0}
            onChange={e => updateOutcomeProbability(index, +e.currentTarget.value)}
            type="number"
            disabled={isUniform}
            value={outcome.probability}
          />
        }
        placeholderText="%"
      />
      <ButtonRemove
        disabled={disabled}
        onClick={() => {
          removeOutcome(index)
        }}
        title={`Remove outcome ${index + 1}`}
        tabIndex={-1}
      />
    </OutcomeItem>
  ))

  return (
    <>
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
          <div />
        </OutcomesTitles>
        <OutcomeItems>{outcomesToRender}</OutcomeItems>
        {messageErrorToRender()}
        <TotalWrapper>
          <TotalTitle>
            <strong>Total:</strong> {outcomes.length} outcomes
          </TotalTitle>

          <TotalValue>
            <TotalValueColor error={totalProbabilities !== 100} isUniform={isUniform}>
              {totalProbabilities}
            </TotalValueColor>
            %
          </TotalValue>
        </TotalWrapper>
        <CheckboxWrapper>
          <StyledCheckbox
            title="Distribute uniformly"
            name="distributeUniformly"
            onChange={handleIsUniformChanged}
          />
          <StyledLabel htmlFor="distributeUniformly">Distribute uniformly</StyledLabel>
        </CheckboxWrapper>
      </OutcomesWrapper>

      {canAddOutcome && (
        <NewOutcome>
          <Textfield
            type="text"
            placeholder="Add new outcome"
            value={newOutcomeName}
            onChange={e => setNewOutcomeName(e.target.value)}
          />
          <ButtonAdd disabled={!newOutcomeName} onClick={addNewOutcome} title="Add new outcome" />
        </NewOutcome>
      )}
    </>
  )
}

export { Outcomes }
