/* eslint-env jest */
import '@testing-library/jest-dom/extend-expect'
import { fireEvent, render } from '@testing-library/react'
import React from 'react'
import { ThemeProvider } from 'styled-components'

import theme from '../../../../../../theme'

import { Outcomes } from './index'

const renderOutcomes = (props: any) =>
  render(
    <ThemeProvider theme={theme}>
      <Outcomes {...props} />
    </ThemeProvider>,
  )

test('should remove an outcome', () => {
  const onChangeFn = jest.fn()

  const { getByTestId, getByTitle } = renderOutcomes({
    outcomes: [
      { name: 'red', probability: 25 },
      { name: 'green', probability: 25 },
      { name: 'blue', probability: 25 },
      { name: 'black', probability: 25 },
    ],
    onChange: onChangeFn,
  })

  fireEvent.click(getByTestId('toggle-manual-probabilities'))
  fireEvent.click(getByTitle('Remove outcome 2'))

  expect(onChangeFn).toHaveBeenCalledWith([
    { name: 'red', probability: 25 },
    { name: 'blue', probability: 25 },
    { name: 'black', probability: 25 },
  ])
})

test('should add an outcome with probability > 0', () => {
  const onChangeFn = jest.fn()

  const { getByPlaceholderText, getByTestId, getByTitle } = renderOutcomes({
    outcomes: [
      { name: 'red', probability: 25 },
      { name: 'green', probability: 25 },
      { name: 'blue', probability: 24 },
    ],
    onChange: onChangeFn,
    canAddOutcome: true,
  })

  fireEvent.click(getByTestId('toggle-manual-probabilities'))
  const newOutcomeInputText: any = getByPlaceholderText('Add new outcome')
  const newOutcomeInputValue: any = getByPlaceholderText('0.00')

  fireEvent.change(newOutcomeInputText, { target: { value: 'black' } })
  fireEvent.change(newOutcomeInputValue, { target: { value: '1' } })
  fireEvent.click(getByTitle('Add new outcome'))

  expect(newOutcomeInputText.value).toEqual('')
  expect(onChangeFn).toHaveBeenCalledWith([
    { name: 'red', probability: 25 },
    { name: 'green', probability: 25 },
    { name: 'blue', probability: 24 },
    { name: 'black', probability: 1 },
  ])
})

test('should disable add button with probability 0', () => {
  const onChangeFn = jest.fn()

  const { getByPlaceholderText, getByTestId, getByTitle } = renderOutcomes({
    outcomes: [],
    onChange: onChangeFn,
    canAddOutcome: true,
  })

  fireEvent.click(getByTestId('toggle-manual-probabilities'))
  const newOutcomeInputText: any = getByPlaceholderText('Add new outcome')
  const addButton = getByTitle('Add new outcome')

  fireEvent.change(newOutcomeInputText, { target: { value: 'black' } })

  expect(addButton).toBeDisabled()
})
