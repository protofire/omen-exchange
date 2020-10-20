import React, { ChangeEvent } from 'react'
import styled from 'styled-components'

import { ConnectedWeb3Context } from '../../../../../../hooks'
import { ButtonType } from '../../../../../button/button_styling_types'
import { DateField, FormRow, Textfield } from '../../../../../common'
import { QuestionInput } from '../../../../../common/form/question_input'
import { Categories } from '../../../../common/categories'

import { ButtonCategory, ButtonCategoryTextOverflow, Column, GridTwoColumns } from './ask_question_step'

interface Props {
  context: ConnectedWeb3Context
  handleChange: (event: ChangeEvent<HTMLInputElement> | ChangeEvent<HTMLSelectElement>) => any
  handleDateChange: (date: Date | null) => any
  question: string
  resolution: Date | null
  lowerBound: string
  upperBound: string
  startingPoint: string
  unit: string
  tomorrow: Date
  categoriesCustom: string[]
  category: string
  categoryButtonFocus: boolean
  first: number
  handleCategoryChange: (e: any) => void
  loadMoreButton: boolean
  setFirst: React.Dispatch<React.SetStateAction<number>>
  toggleCategoryButtonFocus: () => void
}

export const CreateScalarMarket = (props: Props) => {
  const {
    categoriesCustom,
    category,
    categoryButtonFocus,
    context,
    first,
    handleCategoryChange,
    handleChange,
    handleDateChange,
    loadMoreButton,
    lowerBound,
    question,
    resolution,
    setFirst,
    startingPoint,
    toggleCategoryButtonFocus,
    tomorrow,
    unit,
    upperBound,
  } = props

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
      <GridTwoColumns>
        <Column>
          <FormRow
            formField={<Textfield name="lowerBound" onChange={handleChange} placeholder="0" value={lowerBound} />}
            title={'Lower Bound'}
          />
          <FormRow
            formField={<Textfield name="upperBound" onChange={handleChange} placeholder="1000" value={upperBound} />}
            title={'Upper Bound'}
          />
        </Column>
        <Column>
          <FormRow
            formField={
              <Textfield name="startingPoint" onChange={handleChange} placeholder="500" value={startingPoint} />
            }
            title={'Starting Point'}
          />
          <FormRow
            formField={<Textfield name="unit" onChange={handleChange} placeholder="Ether" value={unit} />}
            title={'Unit of measurement'}
          />
        </Column>
        <Column>
          <FormRow
            formField={
              <DateField
                disabled={false}
                minDate={tomorrow}
                name="resolution"
                onChange={handleDateChange}
                selected={resolution}
              />
            }
            title={'Closing Date (UTC)'}
          />
        </Column>
        <Column>
          <FormRow
            formField={
              <ButtonCategory
                buttonType={ButtonType.secondaryLine}
                disabled={false}
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
    </>
  )
}
