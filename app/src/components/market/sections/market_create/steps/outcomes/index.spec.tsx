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

test('should add an outcome with probability >= 0', () => {
  const onChangeFn = jest.fn()

  const { getByTestId } = renderOutcomes({
    outcomes: [
      { name: 'red', probability: 25 },
      { name: 'green', probability: 25 },
      { name: 'blue', probability: 24 },
    ],
    onChange: onChangeFn,
    canAddOutcome: true,
  })

  fireEvent.click(getByTestId('toggle-manual-probabilities'))
  fireEvent.click(getByTestId('new-outcome-button'))

  expect(onChangeFn).toHaveBeenCalledWith([
    { name: 'red', probability: 25 },
    { name: 'green', probability: 25 },
    { name: 'blue', probability: 24 },
    { name: '', probability: 0 },
  ])
})
