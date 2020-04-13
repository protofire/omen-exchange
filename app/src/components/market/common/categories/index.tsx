import React from 'react'
import styled from 'styled-components'

import { CATEGORIES } from '../../../../common/constants'
import { Button } from '../../../button'
import { ButtonType } from '../../../button/button_styling_types'

interface Props {
  categories: string[]
  name: string
  onChange?: any
  selectedCategory: string
}

const Wrapper = styled.div`
  border-top: 1px solid ${props => props.theme.borders.borderColor};
  display: flex;
  flex-wrap: wrap;
  padding: 20px 0 6px;
`

const CategoryButton = styled(Button)<{ isSelected: boolean }>`
  margin: 0 8px 14px 0;
  cursor: ${props => (props.isSelected ? 'default' : 'pointer')};

  &,
  &:hover {
    border-color: ${props =>
      props.isSelected ? props.theme.colors.tertiaryDark : props.theme.buttonSecondaryLine.borderColor};
  }
`

export const Categories = (props: Props) => {
  const { categories, name, onChange, selectedCategory, ...restProps } = props

  const allCategories = CATEGORIES.concat(categories.filter(item => CATEGORIES.indexOf(item) < 0))
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
            isSelected={option.value === selectedCategory}
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
    </Wrapper>
  )
}
