/* eslint-env jest */
import { computeBalanceAfterTrade } from '../computeBalanceAfterTrade'

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
      const result = computeBalanceAfterTrade(holdings, outcomeIndex, collateral, shares)

      result.forEach((x, i) => expect(x.toNumber()).toBeCloseTo(expected[i]))
    },
  )

  describe('when index is negative', () => {
    it('throws', () => {
      expect(() => computeBalanceAfterTrade([100, 100, 100], -1, 50, 100)).toThrow()
    })
  })

  describe("when index is equal to array's length", () => {
    it('throws', () => {
      expect(() => computeBalanceAfterTrade([100, 100, 100], 3, 50, 100)).toThrow()
    })
  })

  describe("when index is bigger than array's length", () => {
    it('throws', () => {
      expect(() => computeBalanceAfterTrade([100, 100, 100], 10, 50, 100)).toThrow()
    })
  })

  describe("when trade drains entirety of an outcome's balance", () => {
    it('throws', () => {
      expect(() => computeBalanceAfterTrade([100, 100, 100], 10, 0, 100)).toThrow()
    })
  })
})
