/* eslint-env jest */

import { Zero } from 'ethers/constants'
import { bigNumberify } from 'ethers/utils'

import { calcAddFundingSendAmounts } from '../index'

describe('calcAddFundingSendAmounts', () => {
  it('all holdings are different', () => {
    const result = calcAddFundingSendAmounts(bigNumberify(10), [1, 2, 3].map(bigNumberify))

    expect(result).toStrictEqual([7, 4, 0].map(bigNumberify))
  })

  it('all holdings are equal', () => {
    const result = calcAddFundingSendAmounts(bigNumberify(10), [3, 3, 3].map(bigNumberify))

    expect(result).toStrictEqual([Zero, Zero, Zero])
  })
  it('no funding', () => {
    const result = calcAddFundingSendAmounts(bigNumberify(10), [3, 3, 3].map(bigNumberify), bigNumberify(0))

    expect(result).toBe(null)
  })
})
