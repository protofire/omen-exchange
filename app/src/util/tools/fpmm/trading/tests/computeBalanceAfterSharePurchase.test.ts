/* eslint-env jest */
import { bigNumberify } from 'ethers/utils'

import { computeBalanceAfterSharePurchase } from '../index'

const testCases: [[number[], number, number, number, number], number[]][] = [
  [
    [[100, 100], 0, 50, 100, 0],
    [50, 150],
  ],
  [
    [[100, 100], 1, 50, 100, 0],
    [150, 50],
  ],
  [
    [[150, 150], 0, 50, 100, 1],
    [50, 150],
  ],
  [
    [[100, 100], 0, 50, 100, 0.5],
    [25, 125],
  ],
  [
    [[875, 875], 0, 500, 1000, 0.2],
    [275, 1275],
  ],

  [
    [[100, 100, 100], 2, 50, 100, 0],
    [150, 150, 50],
  ],
]

describe('computeBalanceAfterSharePurchase', () => {
  it.each(testCases)(
    `should compute the right balance after sale of shares`,
    ([holdings, outcomeIndex, collateral, shares, fees], expected) => {
      const result = computeBalanceAfterSharePurchase(
        holdings.map(bigNumberify),
        outcomeIndex,
        bigNumberify(collateral),
        bigNumberify(shares),
        fees,
      )

      result.forEach((x, i) => expect(x.toNumber()).toBeCloseTo(expected[i]))
    },
  )

  describe('when index is negative', () => {
    it('throws', () => {
      expect(() =>
        computeBalanceAfterSharePurchase(
          [bigNumberify(100), bigNumberify(100), bigNumberify(100)],
          -1,
          bigNumberify(50),
          bigNumberify(100),
          0,
        ),
      ).toThrow()
    })
  })

  describe("when index is equal to array's length", () => {
    it('throws', () => {
      expect(() =>
        computeBalanceAfterSharePurchase([100, 100, 100].map(bigNumberify), 3, bigNumberify(50), bigNumberify(100), 0),
      ).toThrow()
    })
  })

  describe("when index is bigger than array's length", () => {
    it('throws', () => {
      expect(() =>
        computeBalanceAfterSharePurchase([100, 100, 100].map(bigNumberify), 10, bigNumberify(50), bigNumberify(100), 0),
      ).toThrow()
    })
  })

  describe("when trade drains entirety of an outcome's balance", () => {
    it('throws', () => {
      expect(() =>
        computeBalanceAfterSharePurchase([100, 100, 100].map(bigNumberify), 10, bigNumberify(0), bigNumberify(100), 0),
      ).toThrow()
    })
  })
})
