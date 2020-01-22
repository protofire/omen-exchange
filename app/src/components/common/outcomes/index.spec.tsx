/* eslint-env jest */
import '@testing-library/jest-dom/extend-expect'
import React from 'react'
import { render, fireEvent, getByPlaceholderText, getByTitle } from '@testing-library/react'
import { ThemeProvider } from 'styled-components'
import theme from '../../../theme'

import { Outcomes } from './index'

const renderOutcomes = (props: any) =>
  render(
    <ThemeProvider theme={theme}>
      <Outcomes {...props} />
    </ThemeProvider>,
  )

test('should change the probability of the first input', () => {
  const onChangeFn = jest.fn()

  const { getByTestId } = renderOutcomes({
    outcomes: [{ name: 'yes', probability: 50 }, { name: 'no', probability: 50 }],
    onChange: onChangeFn,
  })

  const firstInput = getByTestId('outcome_0')

  fireEvent.change(firstInput, { target: { value: '5' } })

  expect(onChangeFn).toHaveBeenCalledWith([
    {
      name: 'yes',
      probability: 5,
    },
    {
      name: 'no',
      probability: 95,
    },
  ])
})

test('should not change the outcomes if the probability is negative', () => {
  const onChangeFn = jest.fn()

  const { getByTestId } = renderOutcomes({
    outcomes: [{ name: 'yes', probability: 40 }, { name: 'no', probability: 60 }],
    onChange: onChangeFn,
  })

  const firstInput: any = getByTestId('outcome_0')
  const secondInput: any = getByTestId('outcome_1')

  fireEvent.change(firstInput, { target: { value: '-5' } })

  expect(onChangeFn).not.toHaveBeenCalled()
  expect(firstInput.value).toBe('40')
  expect(secondInput.value).toBe('60')
})

test('should not change the outcomes if the probability is greater than 100', () => {
  const onChangeFn = jest.fn()

  const { getByTestId } = renderOutcomes({
    outcomes: [{ name: 'yes', probability: 40 }, { name: 'no', probability: 60 }],
    onChange: onChangeFn,
  })

  const firstInput: any = getByTestId('outcome_0')
  const secondInput: any = getByTestId('outcome_1')

  fireEvent.change(firstInput, { target: { value: '110' } })

  expect(onChangeFn).not.toHaveBeenCalled()
  expect(firstInput.value).toBe('40')
  expect(secondInput.value).toBe('60')
})

test('should change the probability of the second input', () => {
  const onChangeFn = jest.fn()

  const { getByTestId } = renderOutcomes({
    outcomes: [{ name: 'yes', probability: 50 }, { name: 'no', probability: 50 }],
    onChange: onChangeFn,
  })

  const firstInput = getByTestId('outcome_1')

  fireEvent.change(firstInput, { target: { value: '90' } })

  expect(onChangeFn).toHaveBeenCalledWith([
    {
      name: 'yes',
      probability: 10,
    },
    {
      name: 'no',
      probability: 90,
    },
  ])
})

test('should not modify the probabilities of the other inputs if there are more than two outcomes', () => {
  const onChangeFn = jest.fn()

  const { getByTestId } = renderOutcomes({
    outcomes: [
      { name: 'red', probability: 33 },
      { name: 'green', probability: 33 },
      { name: 'blue', probability: 34 },
    ],
    onChange: onChangeFn,
  })

  const firstInput = getByTestId('outcome_0')

  fireEvent.change(firstInput, { target: { value: '30' } })

  expect(onChangeFn).toHaveBeenCalledWith([
    { name: 'red', probability: 30 },
    { name: 'green', probability: 33 },
    { name: 'blue', probability: 34 },
  ])
})

test('should change the probability of the third input', () => {
  const onChangeFn = jest.fn()

  const { getByTestId } = renderOutcomes({
    outcomes: [
      { name: 'red', probability: 30 },
      { name: 'green', probability: 33 },
      { name: 'blue', probability: 34 },
    ],
    onChange: onChangeFn,
  })

  const thirdInput = getByTestId('outcome_2')

  fireEvent.change(thirdInput, { target: { value: '20' } })

  expect(onChangeFn).toHaveBeenCalledWith([
    { name: 'red', probability: 30 },
    { name: 'green', probability: 33 },
    { name: 'blue', probability: 20 },
  ])
})

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

test('should maintain uniform probabilities when an outcome is removed', () => {
  const onChangeFn = jest.fn()

  const { getByTitle } = renderOutcomes({
    outcomes: [
      { name: 'red', probability: 25 },
      { name: 'green', probability: 25 },
      { name: 'blue', probability: 25 },
      { name: 'black', probability: 25 },
    ],
    onChange: onChangeFn,
    isUniform: true,
  })

  fireEvent.click(getByTitle('Remove outcome 2'))

  expect(onChangeFn).toHaveBeenCalledWith([
    { name: 'red', probability: 100 / 3 },
    { name: 'blue', probability: 100 / 3 },
    { name: 'black', probability: 100 / 3 },
  ])
})

test('should add an outcome', () => {
  const onChangeFn = jest.fn()

  const { getByTitle, getByPlaceholderText } = renderOutcomes({
    outcomes: [
      { name: 'red', probability: 25 },
      { name: 'green', probability: 25 },
      { name: 'blue', probability: 25 },
    ],
    onChange: onChangeFn,
    isUniform: false,
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

test('should maintain uniform probabilities when an outcome is added', () => {
  const onChangeFn = jest.fn()

  const { getByTitle, getByPlaceholderText } = renderOutcomes({
    outcomes: [
      { name: 'red', probability: 25 },
      { name: 'green', probability: 25 },
      { name: 'blue', probability: 25 },
    ],
    onChange: onChangeFn,
    isUniform: true,
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
    { name: 'black', probability: 25 },
  ])
})

test('should disable probabilities inputs when isUniform is checked', () => {
  const onChangeFn = jest.fn()

  const { getByTestId, getByTitle } = renderOutcomes({
    outcomes: [
      { name: 'red', probability: 25 },
      { name: 'green', probability: 25 },
      { name: 'blue', probability: 25 },
    ],
    onChange: onChangeFn,
    isUniform: true,
    canAddOutcome: true,
  })

  const firstInput = getByTestId('outcome_0')
  expect(firstInput).toBeDisabled()
})

test('should distribute probabilities when isUniform is checked', () => {
  const onChangeFn = jest.fn()

  const { getByTitle } = renderOutcomes({
    outcomes: [
      { name: 'red', probability: 5 },
      { name: 'green', probability: 35 },
      { name: 'blue', probability: 15 },
    ],
    onChange: onChangeFn,
    isUniform: false,
    setIsUniform: jest.fn(),
    canAddOutcome: true,
  })

  const isUniformCheckbox = getByTitle('Distribute uniformly')
  fireEvent.click(isUniformCheckbox)
  expect(isUniformCheckbox).toBeChecked()
  expect(onChangeFn).toHaveBeenCalledWith([
    { name: 'red', probability: 100 / 3 },
    { name: 'green', probability: 100 / 3 },
    { name: 'blue', probability: 100 / 3 },
  ])
})
