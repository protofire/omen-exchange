/* eslint-env jest */
import '@testing-library/jest-dom/extend-expect'
import React from 'react'
import { render, fireEvent } from '@testing-library/react'
import { ThemeProvider } from 'styled-components'
import theme from '../../../theme'

import { Outcomes } from './index'

const onChangeFn = jest.fn()
const renderOutcomes = (props: any) =>
  render(
    <ThemeProvider theme={theme}>
      <Outcomes onChange={onChangeFn} {...props} />
    </ThemeProvider>,
  )

test('should change the probability of the first input', () => {
  const { getByTestId } = renderOutcomes({
    outcomes: [{ name: 'yes', probability: 50 }, { name: 'no', probability: 50 }],
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
  const { getByTestId } = renderOutcomes({
    outcomes: [{ name: 'yes', probability: 40 }, { name: 'no', probability: 60 }],
  })

  const firstInput: any = getByTestId('outcome_0')
  const secondInput: any = getByTestId('outcome_1')

  fireEvent.change(firstInput, { target: { value: '-5' } })

  expect(onChangeFn).not.toHaveBeenCalled()
  expect(firstInput.value).toBe('40')
  expect(secondInput.value).toBe('60')
})

test('should not change the outcomes if the probability is greater than 100', () => {
  const { getByTestId } = renderOutcomes({
    outcomes: [{ name: 'yes', probability: 40 }, { name: 'no', probability: 60 }],
  })

  const firstInput: any = getByTestId('outcome_0')
  const secondInput: any = getByTestId('outcome_1')

  fireEvent.change(firstInput, { target: { value: '110' } })

  expect(onChangeFn).not.toHaveBeenCalled()
  expect(firstInput.value).toBe('40')
  expect(secondInput.value).toBe('60')
})

test('should change the probability of the second input', () => {
  const { getByTestId } = renderOutcomes({
    outcomes: [{ name: 'yes', probability: 50 }, { name: 'no', probability: 50 }],
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
  const { getByTestId } = renderOutcomes({
    outcomes: [
      { name: 'red', probability: 33 },
      { name: 'green', probability: 33 },
      { name: 'blue', probability: 34 },
    ],
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
  const { getByTestId } = renderOutcomes({
    outcomes: [
      { name: 'red', probability: 30 },
      { name: 'green', probability: 33 },
      { name: 'blue', probability: 34 },
    ],
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
  const { getByTestId } = renderOutcomes({
    outcomes: [
      { name: 'red', probability: 25 },
      { name: 'green', probability: 25 },
      { name: 'blue', probability: 25 },
      { name: 'black', probability: 25 },
    ],
    errorMessages: ['Error message one', 'Error message two'],
  })

  const firstErrorMessage = getByTestId('outcome_error_message_0')
  const secondErrorMessage = getByTestId('outcome_error_message_1')

  expect(firstErrorMessage.textContent).toEqual('Error message one')
  expect(secondErrorMessage.textContent).toEqual('Error message two')
})
