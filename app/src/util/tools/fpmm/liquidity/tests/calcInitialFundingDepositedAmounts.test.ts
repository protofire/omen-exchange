/* eslint-env jest */

import { bigNumberify } from 'ethers/utils'

import { calcInitialFundingDepositedAmounts } from '../calcInitialFundingDepositedAmounts'

describe('calcInitialFundingDepositedAmounts', () => {
  it('Distribution hint is non-uniform', () => {
    const result = calcInitialFundingDepositedAmounts(bigNumberify(10), [1, 2, 3].map(bigNumberify))

    expect(result).toStrictEqual([3, 6, 10].map(bigNumberify))
  })

  it('Distribution hint is uniform', () => {
    const result = calcInitialFundingDepositedAmounts(bigNumberify(10), [3, 3, 3].map(bigNumberify))

    expect(result).toStrictEqual([10, 10, 10].map(bigNumberify))
  })

  it('Distribution hint includes a zero', () => {
    expect(() => calcInitialFundingDepositedAmounts(bigNumberify(10), [0, 0, 0].map(bigNumberify))).toThrowError(
      "Invalid Distribution Hint - can't assign a weight of zero to an outcome",
    )
  })
})
