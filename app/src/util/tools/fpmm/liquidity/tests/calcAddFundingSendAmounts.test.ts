/* eslint-env jest */

import { Zero } from 'ethers/constants'
import { bigNumberify } from 'ethers/utils'

import { calcAddFundingSendAmounts } from '../calcAddFundingSendAmounts'

describe('calcAddFundingSendAmounts', () => {
  it('all holdings are different', () => {
    const result = calcAddFundingSendAmounts(bigNumberify(10), [1, 2, 3].map(bigNumberify))

    expect(result).toStrictEqual([7, 4, 0].map(bigNumberify))
  })

  it('all holdings are equal', () => {
    const result = calcAddFundingSendAmounts(bigNumberify(10), [3, 3, 3].map(bigNumberify))

    expect(result).toStrictEqual([Zero, Zero, Zero])
  })
})
