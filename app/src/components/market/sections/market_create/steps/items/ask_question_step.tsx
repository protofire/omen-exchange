import React, { ChangeEvent, useCallback, useState } from 'react'
import { useHistory } from 'react-router'
import styled, { css } from 'styled-components'

import {
  DISABLE_ARBITRATOR_IN_CREATION,
  DISABLE_CATEGORIES_IN_CREATION,
  MAX_OUTCOME_ALLOWED,
} from '../../../../../../common/constants'
import { useConnectedWeb3Context } from '../../../../../../hooks/connectedWeb3'
import { Arbitrator, Question } from '../../../../../../util/types'
import { Button } from '../../../../../button'
import { ButtonType } from '../../../../../button/button_styling_types'
import { DateField, FormRow } from '../../../../../common'
import { CommonDisabledCSS } from '../../../../../common/form/common_styled'
import { QuestionInput } from '../../../../../common/form/question_input'
import { Arbitrators } from '../../../../common/arbitrators'
import { Categories } from '../../../../common/categories'
import { ButtonContainerFullWidth, LeftButton } from '../../../../common/common_styled'
import { CreateCard } from '../../../../common/create_card'
import { Outcome, Outcomes } from '../outcomes'

const ButtonCategoryFocusCSS = css`
  &,
  &:hover {
    background-color: ${props => props.theme.colors.secondary};
    border-color: ${props => props.theme.colors.secondary};
    color: ${props => props.theme.colors.primary};
    font-weight: 500;
  }
`

const ButtonCategory = styled(Button)<{ focus: boolean; isACategorySelected: boolean }>`
  max-width: 100%;
  padding-left: 10px;
  padding-right: 10px;
  width: 100%;
  &,
  &:hover {
    color: ${props => (props.isACategorySelected ? props.theme.colors.textColorDark : '#86909e')};
    font-weight: 400;
  }

  ${props => (props.focus ? ButtonCategoryFocusCSS : '')}
  ${CommonDisabledCSS}
`

ButtonCategory.defaultProps = {
  focus: false,
}

const ButtonCategoryTextOverflow = styled.span`
  display: block;
  max-width: 100%;
  overflow: hidden;
  text-align: center;
  text-overflow: ellipsis;
  white-space: nowrap;
  width: 100%;
`

const GridThreeColumns = styled.div`
  border-top: 1px solid ${props => props.theme.borders.borderColor};
  column-gap: 20px;
  display: grid;
  grid-template-columns: 1fr;
  padding: 20px 0;
  row-gap: 20px;

  @media (min-width: ${props => props.theme.themeBreakPoints.md}) {
    grid-template-columns: 1fr 1fr 1fr;
  }
`

const Column = styled.div`
  @media (min-width: ${props => props.theme.themeBreakPoints.md}) {
    max-width: 165px;
  }
`

const ButtonWithReadyToGoStatusCSS = css`
  &,
  &:hover {
    background-color: ${props => props.theme.colors.primary};
    border-color: ${props => props.theme.colors.primary};
    color: #fff;
    font-weight: 500;
  }
`

const ButtonWithReadyToGoStatus = styled(Button)<{ readyToGo: boolean }>`
  ${props => props.readyToGo && ButtonWithReadyToGoStatusCSS}
`

interface Props {
  next: () => void
  values: {
    question: string
    category: string
    categoriesCustom: string[]
    resolution: Date | null
    arbitrator: Arbitrator
    arbitratorsCustom: Arbitrator[]
    loadedQuestionId: Maybe<string>
    outcomes: Outcome[]
  }
  addArbitratorCustom: (arbitrator: Arbitrator) => void
  addCategoryCustom: (category: string) => void
  handleArbitratorChange: (arbitrator: Arbitrator) => any
  handleChange: (event: ChangeEvent<HTMLInputElement> | ChangeEvent<HTMLSelectElement>) => any
  handleClearQuestion: () => any
  handleDateChange: (date: Date | null) => any
  handleOutcomesChange: (newOutcomes: Outcome[]) => any
  handleQuestionChange: (question: Question, arbitrator: Arbitrator) => any
}

const AskQuestionStep = (props: Props) => {
  const context = useConnectedWeb3Context()

  const {
    addArbitratorCustom,
    addCategoryCustom,
    handleArbitratorChange,
    handleChange,
    handleClearQuestion,
    handleDateChange,
    handleOutcomesChange,
    handleQuestionChange,
    values,
  } = props

  const {
    arbitrator,
    arbitratorsCustom,
    categoriesCustom,
    category,
    loadedQuestionId,
    outcomes,
    question,
    resolution,
  } = values

  const history = useHistory()

  const totalProbabilities = outcomes.reduce((total, cur) => total + cur.probability, 0)
  const totalProbabilitiesNotFull = totalProbabilities !== 100
  const isContinueButtonDisabled =
    totalProbabilitiesNotFull || outcomes.length < 2 || !question || !resolution || !category

  const canAddOutcome = outcomes.length < MAX_OUTCOME_ALLOWED && !loadedQuestionId

  const [categoryButtonFocus, setCategoryButtonFocus] = useState(false)

  const toggleCategoryButtonFocus = useCallback(() => {
    setCategoryButtonFocus(!categoryButtonFocus)
  }, [categoryButtonFocus])

  const handleCategoryChange = (e: any) => {
    setCategoryButtonFocus(false)
    handleChange(e)
  }

  return (
    <CreateCard>
      <FormRow
        formField={
          <QuestionInput
            addArbitratorCustomValue={addArbitratorCustom}
            addCategoryCustomValue={addCategoryCustom}
            context={context}
            disabled={!!loadedQuestionId}
            name="question"
            onChange={handleChange}
            onChangeQuestion={handleQuestionChange}
            onClearQuestion={handleClearQuestion}
            placeholder="What question do you want the world predict?"
            value={question}
          />
        }
      />
      <Outcomes
        canAddOutcome={canAddOutcome}
        disabled={!!loadedQuestionId}
        onChange={handleOutcomesChange}
        outcomes={outcomes}
        totalProbabilities={totalProbabilities}
      />
      <GridThreeColumns>
        <Column>
          <FormRow
            formField={
              <DateField
                disabled={!!loadedQuestionId}
                minDate={new Date()}
                name="resolution"
                onChange={handleDateChange}
                selected={resolution}
              />
            }
            title={'Earliest Resolution Date'}
          />
        </Column>
        <Column>
          <FormRow
            formField={
              <ButtonCategory
                buttonType={ButtonType.secondaryLine}
                disabled={!!loadedQuestionId || DISABLE_CATEGORIES_IN_CREATION}
                focus={categoryButtonFocus}
                isACategorySelected={category !== ''}
                onClick={toggleCategoryButtonFocus}
              >
                <ButtonCategoryTextOverflow>{category ? category : 'Select Category'}</ButtonCategoryTextOverflow>
              </ButtonCategory>
            }
            title={'Category'}
          />
        </Column>
        <Column>
          <FormRow
            formField={
              <Arbitrators
                customValues={arbitratorsCustom}
                disabled={!!loadedQuestionId || DISABLE_ARBITRATOR_IN_CREATION}
                networkId={context.networkId}
                onChangeArbitrator={handleArbitratorChange}
                value={arbitrator}
              />
            }
            title={'Arbitrator'}
          />
        </Column>
      </GridThreeColumns>
      {categoryButtonFocus && (
        <Categories
          categories={categoriesCustom}
          name="category"
          onChange={handleCategoryChange}
          selectedCategory={category}
        />
      )}
      <ButtonContainerFullWidth borderTop={true}>
        <LeftButton buttonType={ButtonType.secondaryLine} onClick={() => history.push(`/`)}>
          Cancel
        </LeftButton>
        <ButtonWithReadyToGoStatus
          buttonType={ButtonType.secondaryLine}
          disabled={isContinueButtonDisabled}
          onClick={props.next}
          readyToGo={!isContinueButtonDisabled}
        >
          Continue
        </ButtonWithReadyToGoStatus>
      </ButtonContainerFullWidth>
    </CreateCard>
  )
}

export { AskQuestionStep }
