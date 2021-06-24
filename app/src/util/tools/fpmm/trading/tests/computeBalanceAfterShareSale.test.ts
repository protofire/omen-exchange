/* eslint-env jest */
import { computeBalanceAfterShareSale } from '../computeBalanceAfterShareSale'

const testCases: [[string[], number, string, string, number], string[]][] = [
  [
    [['50', '150'], 0, '50', '100', 0],
    ['100', '100'],
  ],
  [
    [['150', '50'], 1, '50', '100', 0],
    ['100', '100'],
  ],
  [
    [['50', '150'], 0, '50', '100', 1],
    ['150', '150'],
  ],
  [
    [['50', '150'], 0, '50', '100', 0.5],
    ['50', '50'],
  ],
  [
    [['500', '1500'], 0, '500', '1000', 0.2],
    ['875', '875'],
  ],

  [
    [['150', '150', '50'], 2, '50', '100', 0],
    ['100', '100', '100'],
  ],
  [
    [['18023', '156155227'], 0, '97968575', '100000000', 0.02],
    ['50890', '56188094'],
  ],
  [
    [['18023', '156155227'], 0, '153028854', '1000000000', 0.02],
    ['843867381', '4585'],
  ],
]

describe('computeBalanceAfterShareSale', () => {
  it.each(testCases)(
    `should compute the right balance after sale of shares`,
    ([holdings, outcomeIndex, collateral, shares, fees], expected) => {
      const result = computeBalanceAfterShareSale(holdings, outcomeIndex, collateral, shares, fees)

      result.forEach((x, i) => expect(x.toNumber()).toBeCloseTo(parseInt(expected[i], 10)))
    },
  )

  describe('when index is negative', () => {
    it('throws', () => {
      expect(() => computeBalanceAfterShareSale([100, 100, 100], -1, 50, 100, 0)).toThrow()
    })
  })

  describe("when index is equal to array's length", () => {
    it('throws', () => {
      expect(() => computeBalanceAfterShareSale([100, 100, 100], 3, 50, 100, 0)).toThrow()
    })
  })

  describe("when index is bigger than array's length", () => {
    it('throws', () => {
      expect(() => computeBalanceAfterShareSale([100, 100, 100], 10, 50, 100, 0)).toThrow()
    })
  })

  describe("when trade drains entirety of an outcome's balance", () => {
    it('throws', () => {
      expect(() => computeBalanceAfterShareSale([100, 100, 100], 10, 0, 100, 0)).toThrow()
    })
  })
})
