import React, { useState } from 'react'
import styled from 'styled-components'

import { CATEGORIES } from '../../../../common/constants'
import { Button } from '../../../button'
import { ButtonType } from '../../../button/button_styling_types'
import { Textfield } from '../../../common/'

interface Props {
  categories: string[]
  name: string
  onChange?: any
  selectedCategory: string
  setFirst: (n: number) => void
  first: number
  loadMoreButton: boolean
}

const Wrapper = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-itmes: center;
  padding: 0 0 6px;
`

const CategoryButton = styled(Button)<{ isSelected: boolean }>`
  margin: 0 8px 14px 0;
  height: 36px;
  &,
  &:hover {
    border-color: ${props =>
      props.isSelected ? props.theme.colors.tertiaryDark : props.theme.buttonSecondaryLine.borderColor};
  }
`

const CategoryInput = styled(Textfield)<{ isSelected: boolean }>`
  height: 32px;
  padding: 0 20px;
  line-height: 1.2;
  width: 9rem;
  margin: 0 18px 14px 0;
  cursor: ${props => (props.isSelected ? 'default' : 'pointer')};

  &,
  &:hover {
    border-color: ${props =>
      props.isSelected ? props.theme.colors.tertiaryDark : props.theme.buttonSecondaryLine.borderColor};
  }
`

export const Categories = (props: Props) => {
  const { categories, first, loadMoreButton, name, onChange, selectedCategory, setFirst, ...restProps } = props
  const [selectedCustom, setSelectedCustom] = useState(false)

  const allCategories = categories.length > 0 ? categories : CATEGORIES

  const options = allCategories.map(category => ({
    label: category,
    value: category,
  }))

  return (
    <Wrapper {...restProps}>
      {options.map(option => {
        return (
          <CategoryButton
            buttonType={ButtonType.secondaryLine}
            isSelected={option.value === selectedCategory.toLowerCase()}
            key={option.value}
            name={name}
            onChange={onChange}
            onClick={onChange}
            value={option.value}
          >
            {option.label}
          </CategoryButton>
        )
      })}
      {loadMoreButton && (
        <CategoryButton
          buttonType={ButtonType.secondaryLine}
          isSelected={false}
          name={'load more'}
          onClick={() => setFirst(first + 8)}
          value={'load more'}
        >
          load more
        </CategoryButton>
      )}
      <CategoryInput
        isSelected={selectedCustom}
        name={'category'}
        onBlur={e => {
          setSelectedCustom(true)
          onChange(e)
        }}
        onClick={() => {
          setSelectedCustom(true)
        }}
        placeholder={'Add Category...'}
        type="text"
      />
    </Wrapper>
  )
}
