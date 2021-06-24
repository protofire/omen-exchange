/* eslint-env jest */

import { Zero } from 'ethers/constants'
import { bigNumberify } from 'ethers/utils'

import { calcInitialFundingSendAmounts } from '../calcInitialFundingSendAmounts'

describe('calcInitialFundingSendAmounts', () => {
  it('all holdings are different', () => {
    const result = calcInitialFundingSendAmounts(bigNumberify(10), [1, 2, 3].map(bigNumberify))

    expect(result).toStrictEqual(['7', '4', '0'].map(bigNumberify))
  })

  it('all holdings are equal', () => {
    const result = calcInitialFundingSendAmounts(bigNumberify(10), [3, 3, 3].map(bigNumberify))

    expect(result).toStrictEqual([Zero, Zero, Zero])
  })

  it('no funding', () => {
    const result = calcInitialFundingSendAmounts(bigNumberify(0), [3, 3, 3].map(bigNumberify))
    expect(result).toStrictEqual([Zero, Zero, Zero])
  })
})
