import { bigNumberify } from 'ethers/utils'

import { calcAddFundingDepositedAmounts } from '../index'

describe('calcAddFundingDepositedAmounts', () => {
  it('all holdings are different', () => {
    const result = calcAddFundingDepositedAmounts(bigNumberify(10), [1, 2, 3].map(bigNumberify))

    expect(result).toStrictEqual([3, 6, 10].map(bigNumberify))
  })

  it('all holdings are equal', () => {
    const result = calcAddFundingDepositedAmounts(bigNumberify(10), [3, 3, 3].map(bigNumberify))

    expect(result).toStrictEqual([10, 10, 10].map(bigNumberify))
  })

  it('initial pool balances includes a zero', () => {
    expect(() => calcAddFundingDepositedAmounts(bigNumberify(10), [0, 0, 0].map(bigNumberify))).toThrowError(
      'Invalid Pool Balances - you must provide a distribution hint for the desired weightings of the pool',
    )
  })
})
