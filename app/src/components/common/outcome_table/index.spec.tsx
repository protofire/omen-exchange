/* eslint-env jest */
import '@testing-library/jest-dom/extend-expect'
import { render, fireEvent } from '@testing-library/react'
import { BigNumber } from 'ethers/utils'
import React from 'react'
import { ThemeProvider } from 'styled-components'

import theme from '../../../theme'
import { BalanceItem, OutcomeSlot, OutcomeTableValue } from '../../../util/types'

import { OutcomeTable } from './index'

const getBalances = (yes: Partial<BalanceItem> = {}, no: Partial<BalanceItem> = {}) => {
  return [
    {
      outcomeName: OutcomeSlot.Yes,
      probability: 50,
      currentPrice: 0.5,
      shares: new BigNumber(0),
      holdings: new BigNumber(0),
      winningOutcome: false,
      ...yes,
    },
    {
      outcomeName: OutcomeSlot.No,
      probability: 50,
      currentPrice: 0.5,
      shares: new BigNumber(0),
      holdings: new BigNumber(0),
      winningOutcome: false,
      ...no,
    },
  ]
}

const renderTable = (component: any) =>
  render(<ThemeProvider theme={theme}>{component}</ThemeProvider>)

const dai = {
  address: '',
  decimals: 18,
  symbol: 'DAI',
}

test('should work with minimal props', () => {
  const balances = getBalances()

  const { asFragment } = renderTable(<OutcomeTable balances={balances} collateral={dai} />)

  expect(asFragment()).toMatchSnapshot()
})

test('should hide radio selections', () => {
  const balances = getBalances()

  const { asFragment } = renderTable(
    <OutcomeTable balances={balances} collateral={dai} displayRadioSelection={false} />,
  )

  expect(asFragment()).toMatchSnapshot()
})

test('should work with disabled columns', () => {
  const balances = getBalances()

  const { asFragment } = renderTable(
    <OutcomeTable
      balances={balances}
      collateral={dai}
      disabledColumns={[OutcomeTableValue.Payout]}
    />,
  )

  expect(asFragment()).toMatchSnapshot()
})

test('should show yes as winning token', () => {
  const balances = getBalances({ winningOutcome: true })

  const { asFragment } = renderTable(
    <OutcomeTable balances={balances} collateral={dai} withWinningOutcome={true} />,
  )

  expect(asFragment()).toMatchSnapshot()
})

test('should show no as winning token', () => {
  const balances = getBalances({}, { winningOutcome: true })

  const { asFragment } = renderTable(
    <OutcomeTable balances={balances} collateral={dai} withWinningOutcome={true} />,
  )

  expect(asFragment()).toMatchSnapshot()
})

test('should show prices after trade', () => {
  const balances = getBalances()

  const { asFragment } = renderTable(
    <OutcomeTable balances={balances} collateral={dai} pricesAfterTrade={[0.75, 0.25]} />,
  )

  expect(asFragment()).toMatchSnapshot()
})

test('should accept a selected outcome', () => {
  const balances = getBalances()

  const { asFragment } = renderTable(
    <OutcomeTable balances={balances} collateral={dai} outcomeSelected={OutcomeSlot.Yes} />,
  )

  expect(asFragment()).toMatchSnapshot()
})

test('should accept a selected outcome', () => {
  const balances = getBalances()

  const onOutcomeChange = jest.fn()

  const { getByTestId } = renderTable(
    <OutcomeTable balances={balances} collateral={dai} outcomeHandleChange={onOutcomeChange} />,
  )

  const radioForYesComponent = getByTestId('outcome_table_radio_Yes')
  const radioForNoComponent = getByTestId('outcome_table_radio_No')

  const radioForYes = radioForYesComponent.querySelector('input')
  const radioForNo = radioForNoComponent.querySelector('input')

  if (!radioForYes || !radioForNo) {
    throw new Error('Radio element not found')
  }

  fireEvent.click(radioForNo)
  expect(onOutcomeChange).toHaveBeenCalledWith(1)
  fireEvent.click(radioForYes)
  expect(onOutcomeChange).toHaveBeenCalledWith(0)
})
