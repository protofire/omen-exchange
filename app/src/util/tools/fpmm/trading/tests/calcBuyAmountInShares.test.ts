/* eslint-env jest */

import { Zero } from 'ethers/constants'
import { bigNumberify } from 'ethers/utils'

import { divBN } from '../../../utils'
import { calcBuyAmountInShares } from '../index'

const testCases: [[string, number, string[]], string][] = [[['1000000', 0, ['100000000', '100000000']], '1970295']]

describe('calcBuyAmountInShares', () => {
  it.each(testCases)(
    `should compute the amount of shares bought`,
    ([investmentAmount, outcomeIndex, poolBalances], expected) => {
      const result = calcBuyAmountInShares(
        bigNumberify(investmentAmount),
        outcomeIndex,
        poolBalances.map(bigNumberify),
        0.01,
      )

      expect(result).not.toBe(null)

      expect(divBN(result, bigNumberify(expected))).toBeCloseTo(1)
    },
  )

  describe('when no holdings', () => {
    it('returns 0', () =>
      expect(calcBuyAmountInShares(bigNumberify(10), 0, [0, 0].map(bigNumberify), 0.1)).toStrictEqual(Zero))
  })

  describe('when no funding', () => {
    it('returns 0', () =>
      expect(calcBuyAmountInShares(bigNumberify(0), 0, [100, 100].map(bigNumberify), 0.1)).toStrictEqual(Zero))
  })
})
