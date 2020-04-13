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

test('should pass some message errors', () => {
  const onChangeFn = jest.fn()

  const { getByTestId } = renderOutcomes({
    outcomes: [
      { name: 'red', probability: 25 },
      { name: 'green', probability: 25 },
      { name: 'blue', probability: 25 },
      { name: 'black', probability: 25 },
    ],
    onChange: onChangeFn,
    errorMessages: ['Error message one', 'Error message two'],
  })

  const firstErrorMessage = getByTestId('outcome_error_message_0')
  const secondErrorMessage = getByTestId('outcome_error_message_1')

  expect(firstErrorMessage.textContent).toEqual('Error message one')
  expect(secondErrorMessage.textContent).toEqual('Error message two')
})

test('should remove an outcome', () => {
  const onChangeFn = jest.fn()

  const { getByTitle } = renderOutcomes({
    outcomes: [
      { name: 'red', probability: 25 },
      { name: 'green', probability: 25 },
      { name: 'blue', probability: 25 },
      { name: 'black', probability: 25 },
    ],
    onChange: onChangeFn,
  })

  fireEvent.click(getByTitle('Remove outcome 2'))

  expect(onChangeFn).toHaveBeenCalledWith([
    { name: 'red', probability: 25 },
    { name: 'blue', probability: 25 },
    { name: 'black', probability: 25 },
  ])
})

test('should add an outcome', () => {
  const onChangeFn = jest.fn()

  const { getByPlaceholderText, getByTitle } = renderOutcomes({
    outcomes: [
      { name: 'red', probability: 25 },
      { name: 'green', probability: 25 },
      { name: 'blue', probability: 25 },
    ],
    onChange: onChangeFn,
    canAddOutcome: true,
  })

  const newOutcomeInput: any = getByPlaceholderText('Add new outcome')
  fireEvent.change(newOutcomeInput, { target: { value: 'black' } })
  fireEvent.click(getByTitle('Add new outcome'))

  expect(newOutcomeInput.value).toEqual('')
  expect(onChangeFn).toHaveBeenCalledWith([
    { name: 'red', probability: 25 },
    { name: 'green', probability: 25 },
    { name: 'blue', probability: 25 },
    { name: 'black', probability: 0 },
  ])
})
