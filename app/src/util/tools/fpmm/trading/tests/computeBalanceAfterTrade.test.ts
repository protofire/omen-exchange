/* eslint-env jest */
import { bigNumberify } from 'ethers/utils'

import { computeBalanceAfterTrade } from '../index'

const testCases: [[number[], number, number, number], number[]][] = [
  [
    [[100, 100], 0, 50, 100],
    [50, 150],
  ],
  [
    [[100, 100], 1, 50, 100],
    [150, 50],
  ],
  [
    [[100, 100, 100], 2, 50, 100],
    [150, 150, 50],
  ],
]

describe('computeBalanceAfterTrade', () => {
  it.each(testCases)(
    `should compute the right balance after trade`,
    ([holdings, outcomeIndex, collateral, shares], expected) => {
      const result = computeBalanceAfterTrade(
        holdings.map(bigNumberify),
        outcomeIndex,
        bigNumberify(collateral),
        bigNumberify(shares),
      )

      result.forEach((x, i) => expect(x.toNumber()).toBeCloseTo(expected[i]))
    },
  )

  describe('when index is negative', () => {
    it('throws', () => {
      expect(() =>
        computeBalanceAfterTrade([100, 100, 100].map(bigNumberify), -1, bigNumberify(50), bigNumberify(100)),
      ).toThrow()
    })
  })

  describe("when index is equal to array's length", () => {
    it('throws', () => {
      expect(() =>
        computeBalanceAfterTrade([100, 100, 100].map(bigNumberify), 3, bigNumberify(50), bigNumberify(100)),
      ).toThrow()
    })
  })

  describe("when index is bigger than array's length", () => {
    it('throws', () => {
      expect(() =>
        computeBalanceAfterTrade([100, 100, 100].map(bigNumberify), 10, bigNumberify(50), bigNumberify(100)),
      ).toThrow()
    })
  })

  describe("when trade drains entirety of an outcome's balance", () => {
    it('throws', () => {
      expect(() =>
        computeBalanceAfterTrade([100, 100, 100].map(bigNumberify), 10, bigNumberify(0), bigNumberify(100)),
      ).toThrow()
    })
  })
})
