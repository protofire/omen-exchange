import React, { ChangeEvent, useCallback, useEffect, useState } from 'react'
import { useHistory } from 'react-router'
import styled, { css } from 'styled-components'

import { DOCUMENT_VALIDITY_RULES, MAX_OUTCOME_ALLOWED } from '../../../../../../common/constants'
import { useConnectedWeb3Context } from '../../../../../../hooks/connectedWeb3'
import { Arbitrator, Question } from '../../../../../../util/types'
import { Button } from '../../../../../button'
import { ButtonType } from '../../../../../button/button_styling_types'
import { DateField, FormRow, FormStateButton } from '../../../../../common'
import { CommonDisabledCSS } from '../../../../../common/form/common_styled'
import { QuestionInput } from '../../../../../common/form/question_input'
import { Arbitrators } from '../../../../common/arbitrators'
import { Categories } from '../../../../common/categories'
import { ButtonContainerFullWidth, MarketBottomNavButton } from '../../../../common/common_styled'
import { CreateCard } from '../../../../common/create_card'
import { WarningMessage } from '../../../../common/warning_message'
import { Outcome, Outcomes } from '../outcomes'

import { ImportMarketContent } from './import_market_content'

const ButtonCategoryFocusCSS = css`
  &,
  &:hover {
    border-color: ${props => props.theme.textfield.borderColorActive};
    color: ${props => props.theme.textfield.color};
  }
`

const ButtonCategory = styled(Button)<{ focus: boolean; isACategorySelected: boolean }>`
  max-width: 100%;
  padding-left: 10px;
  padding-right: 10px;
  width: 100%;
  height: 36px;
  font-weight: normal;
  &,
  &:hover {
    color: ${props =>
      props.isACategorySelected ? props.theme.colors.textColorDark : props.theme.colors.textColorLighter};
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
  text-transform: capitalize;
`

const GridTwoColumns = styled.div`
  column-gap: 16px;
  display: grid;
  grid-template-columns: 1fr;
  padding-bottom: 20px;
  row-gap: 20px;

  @media (min-width: ${props => props.theme.themeBreakPoints.md}) {
    grid-template-columns: 1fr 1fr;
  }
`

const Column = styled.div``

const ButtonWithReadyToGoStatusCSS = css`
  &,
  &:hover {
    background-color: ${props => props.theme.colors.primary};
    border-color: ${props => props.theme.colors.primary};
    color: #fff;
    font-weight: 500;
  }
`

const ButtonWithReadyToGoStatus = styled(MarketBottomNavButton as any)<{ readyToGo: boolean }>`
  ${props => props.readyToGo && ButtonWithReadyToGoStatusCSS}
`

const CategoryImportWrapper = styled.div`
  border-bottom: 1px solid ${props => props.theme.borders.borderDisabled};
  margin-left: -${props => props.theme.cards.paddingHorizontal};
  margin-right: -${props => props.theme.cards.paddingHorizontal};
  padding: 0 ${props => props.theme.cards.paddingHorizontal};
  padding-bottom: 20px;
`

const LeftButton = styled(MarketBottomNavButton as any)`
  margin-right: auto;
`

const StyledButtonContainerFullWidth = styled(ButtonContainerFullWidth as any)`
  padding: 20px 24px;
  padding-bottom: 0;
  margin: 0 -24px;
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
  handleQuestionChange: (question: Question, arbitrator: Arbitrator, outcomes: Outcome[], verifyLabel?: string) => any
  setFirst: React.Dispatch<React.SetStateAction<number>>
  first: number
  loadMoreButton: boolean
}

const AskQuestionStep = (props: Props) => {
  const context = useConnectedWeb3Context()

  const {
    first,
    handleArbitratorChange,
    handleChange,
    handleClearQuestion,
    handleDateChange,
    handleOutcomesChange,
    handleQuestionChange,
    loadMoreButton,
    setFirst,
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
  const [isImport, setIsImport] = useState(!!loadedQuestionId)

  const totalProbabilities = outcomes.reduce((total, cur) => total + (cur.probability ? cur.probability : 0), 0)
  const totalProbabilitiesNotFull = Math.abs(totalProbabilities - 100) > 0.000001
  const outcomeNames = outcomes.map(outcome => outcome.name)
  const isContinueButtonDisabled =
    totalProbabilitiesNotFull ||
    outcomes.length < 2 ||
    !question ||
    !resolution ||
    resolution < new Date() ||
    !category ||
    outcomeNames.map(name => !name).reduce((e1, e2) => e1 || e2) ||
    outcomeNames.map((name, index) => outcomeNames.indexOf(name) !== index).reduce((e1, e2) => e1 || e2)

  const canAddOutcome = outcomes.length < MAX_OUTCOME_ALLOWED && !loadedQuestionId

  const [categoryButtonFocus, setCategoryButtonFocus] = useState(false)

  const today = new Date()
  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)

  useEffect(() => {
    handleClearQuestion()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isImport])

  const toggleCategoryButtonFocus = useCallback(() => {
    setCategoryButtonFocus(!categoryButtonFocus)
  }, [categoryButtonFocus])

  const handleCategoryChange = (e: any) => {
    setCategoryButtonFocus(false)
    handleChange(e)
  }

  return (
    <CreateCard style={{ paddingTop: 20, paddingBottom: 20 }}>
      <CategoryImportWrapper>
        <FormStateButton active={!isImport} onClick={() => setIsImport(false)}>
          Categorical Market
        </FormStateButton>
        <FormStateButton
          active={isImport}
          onClick={() => {
            setIsImport(true)
          }}
        >
          Import Market
        </FormStateButton>
      </CategoryImportWrapper>
      {isImport ? (
        <ImportMarketContent
          context={context}
          handleClearQuestion={handleClearQuestion}
          handleOutcomesChange={handleOutcomesChange}
          loadedQuestionId={loadedQuestionId}
          onSave={handleQuestionChange}
          outcomes={outcomes}
          totalProbabilities={totalProbabilities}
        ></ImportMarketContent>
      ) : (
        <>
          <FormRow
            formField={
              <QuestionInput
                context={context}
                disabled={!!loadedQuestionId}
                name="question"
                onChange={handleChange}
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
          <GridTwoColumns>
            <Column>
              <FormRow
                formField={
                  <DateField
                    disabled={!!loadedQuestionId}
                    minDate={tomorrow}
                    name="resolution"
                    onChange={handleDateChange}
                    selected={resolution}
                  />
                }
                title={'Resolution Date (UTC)'}
              />
            </Column>
            <Column>
              <FormRow
                formField={
                  <ButtonCategory
                    buttonType={ButtonType.secondaryLine}
                    disabled={!!loadedQuestionId}
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
          </GridTwoColumns>
          {categoryButtonFocus && (
            <Categories
              categories={categoriesCustom}
              first={first}
              loadMoreButton={loadMoreButton}
              name="category"
              onChange={handleCategoryChange}
              selectedCategory={category.toLowerCase()}
              setFirst={setFirst}
            />
          )}
          <WarningMessage
            additionalDescription={'.'}
            description={
              "Set the market resolution date at least 6 days after the correct outcome will be known and make sure that this market won't be "
            }
            href={DOCUMENT_VALIDITY_RULES}
            hyperlinkDescription={'invalid'}
            style={{ marginBottom: 0 }}
          />
          <FormRow
            formField={
              <Arbitrators
                customValues={arbitratorsCustom}
                disabled={!!loadedQuestionId}
                networkId={context.networkId}
                onChangeArbitrator={handleArbitratorChange}
                value={arbitrator}
              />
            }
            style={{ marginBottom: 0 }}
            title={'Arbitrator'}
          />
        </>
      )}

      <StyledButtonContainerFullWidth borderTop={true}>
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
      </StyledButtonContainerFullWidth>
    </CreateCard>
  )
}

export { AskQuestionStep }
