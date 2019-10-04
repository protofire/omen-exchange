/* eslint-env jest */
import { ethers } from 'ethers'
import {
  calcNetCost,
  calcPrice,
  computeInitialTradeOutcomeTokens,
  computePriceAfterTrade,
} from './tools'

describe('tools', () => {
  describe('computeInitialTradeOutcomeTokens', () => {
    const testCases: any = [
      [[75, 25], ['1585000000000000000', '0']],
      [[25, 75], ['0', '1585000000000000000']],
      [[90, 10], ['3169900000000000000', '0']],
      [[10, 90], ['0', '3169900000000000000']],
    ]

    for (const [probabilities, expectedResult] of testCases) {
      it(`should compute the right initial trade outcomes for probabilities ${probabilities}`, () => {
        const initialTradeOutcomeTokens = computeInitialTradeOutcomeTokens(
          probabilities,
          ethers.constants.WeiPerEther,
        )

        expect(initialTradeOutcomeTokens[0].toString()).toEqual(expectedResult[0])
        expect(initialTradeOutcomeTokens[1].toString()).toEqual(expectedResult[1])
      })
    }
  })

  describe('calcPrice', () => {
    const testCases: any = [[[100, 100], 0.5], [[100, 32], 0.8], [[100, 230], 0.2]]

    for (const [[funding, holdings], expectedResult] of testCases) {
      it(`should compute the right price for funding ${funding} and holdings ${holdings}`, () => {
        const fundingBN = ethers.utils.bigNumberify(funding)
        const holdingsBN = ethers.utils.bigNumberify(holdings)
        const result = calcPrice(fundingBN, holdingsBN)

        expect(result).toBeCloseTo(expectedResult)
      })
    }
  })

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
        const fundingBN = ethers.utils.bigNumberify(funding)
        const tradeYesBN = ethers.utils.bigNumberify(tradeYes)
        const tradeNoBN = ethers.utils.bigNumberify(tradeNo)
        const result = calcNetCost(fundingBN, priceYes, tradeYesBN, priceNo, tradeNoBN).toNumber()

        expect(result).toBeCloseTo(expectedResult)
      })
    }
  })

  describe('computePriceAfterTrade', () => {
    const testCases: any = [
      [[100, 50, 0, 100, 100], [0.58579, 0.41421]],
      [[100, 0, 50, 100, 100], [0.41421, 0.58579]],
      [[100, 50, 0, 77, 127], [0.6666, 0.3333]],
      [[100, 0, 50, 77, 127], [0.5, 0.5]],
      [[100, -50, 0, 100, 100], [0.41421, 0.58579]],
      [[100, 50, 50, 100, 100], [0.5, 0.5]],
    ]

    for (const [
      [funding, tradeYes, tradeNo, holdingsYes, holdingsNo],
      [expectedPriceYes, expectedPriceNo],
    ] of testCases) {
      it(`should compute the right net cost, `, () => {
        const fundingBN = ethers.utils.bigNumberify(funding)
        const tradeYesBN = ethers.utils.bigNumberify(tradeYes)
        const tradeNoBN = ethers.utils.bigNumberify(tradeNo)
        const holdingsYesBN = ethers.utils.bigNumberify(holdingsYes)
        const holdingsNoBN = ethers.utils.bigNumberify(holdingsNo)
        const [newPriceYes, newPriceNo] = computePriceAfterTrade(
          tradeYesBN,
          tradeNoBN,
          holdingsYesBN,
          holdingsNoBN,
          fundingBN,
        )

        expect(newPriceYes).toBeCloseTo(expectedPriceYes)
        expect(newPriceNo).toBeCloseTo(expectedPriceNo)
      })
    }
  })
})
