import { bigNumberify } from 'ethers/utils'

import { calcNetCost } from '../index'

describe('calcNetCost', () => {
  const testCases: any = [
    [[100, 0.5, 200, 0.5, 0], 132],
    [[100, 0.8, 200, 0.2, 0], 176],
    [[100, 0.5, 0, 0.5, 150], 93],
    [[100, 0.85, 100, 0.15, 0], 88],
    [[100, 0.85, 200000, 0.15, 0], 199976],
    [[100, 0.85, 0, 0.15, 200000], 199726],
  ]

  for (const [[funding, priceYes, tradeYes, priceNo, tradeNo], expectedResult] of testCases) {
    it(`should compute the right net cost, `, () => {
      const fundingBN = bigNumberify(funding)
      const tradeYesBN = bigNumberify(tradeYes)
      const tradeNoBN = bigNumberify(tradeNo)
      const result = calcNetCost(fundingBN, priceYes, tradeYesBN, priceNo, tradeNoBN).toNumber()

      expect(result).toBeCloseTo(expectedResult)
    })
  }
})
