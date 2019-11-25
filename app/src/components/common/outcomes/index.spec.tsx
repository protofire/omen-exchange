/* eslint-env jest */
import '@testing-library/jest-dom/extend-expect'
import React from 'react'
import { render, fireEvent } from '@testing-library/react'

import { Outcomes } from './index'

test('should change the probability of the first input', () => {
  const onChangeFn = jest.fn()

  const { getByTestId } = render(
    <Outcomes
      outcomes={[{ name: 'yes', probability: 50 }, { name: 'no', probability: 50 }]}
      onChange={onChangeFn}
    />,
  )

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

  const { getByTestId } = render(
    <Outcomes
      outcomes={[{ name: 'yes', probability: 40 }, { name: 'no', probability: 60 }]}
      onChange={onChangeFn}
    />,
  )

  const firstInput: any = getByTestId('outcome_0')
  const secondInput: any = getByTestId('outcome_1')

  fireEvent.change(firstInput, { target: { value: '-5' } })

  expect(onChangeFn).not.toHaveBeenCalled()
  expect(firstInput.value).toBe('40')
  expect(secondInput.value).toBe('60')
})

test('should not change the outcomes if the probability is greater than 100', () => {
  const onChangeFn = jest.fn()

  const { getByTestId } = render(
    <Outcomes
      outcomes={[{ name: 'yes', probability: 40 }, { name: 'no', probability: 60 }]}
      onChange={onChangeFn}
    />,
  )

  const firstInput: any = getByTestId('outcome_0')
  const secondInput: any = getByTestId('outcome_1')

  fireEvent.change(firstInput, { target: { value: '110' } })

  expect(onChangeFn).not.toHaveBeenCalled()
  expect(firstInput.value).toBe('40')
  expect(secondInput.value).toBe('60')
})

test('should change the probability of the second input', () => {
  const onChangeFn = jest.fn()

  const { getByTestId } = render(
    <Outcomes
      outcomes={[{ name: 'yes', probability: 50 }, { name: 'no', probability: 50 }]}
      onChange={onChangeFn}
    />,
  )

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

  const { getByTestId } = render(
    <Outcomes
      outcomes={[
        { name: 'red', probability: 33 },
        { name: 'green', probability: 33 },
        { name: 'blue', probability: 34 },
      ]}
      onChange={onChangeFn}
    />,
  )

  const firstInput = getByTestId('outcome_0')

  fireEvent.change(firstInput, { target: { value: '30' } })

  expect(onChangeFn).toHaveBeenCalledWith([
    { name: 'red', probability: 30 },
    { name: 'green', probability: 33 },
    { name: 'blue', probability: 34 },
  ])
})
