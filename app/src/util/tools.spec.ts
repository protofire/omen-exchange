/* eslint-env jest */
import Big from 'big.js'
import { bigNumberify } from 'ethers/utils'
import {
  calcDistributionHint,
  calcNetCost,
  calcPrice,
  calcSellAmountInCollateral,
  divBN,
  getIndexSets,
} from './tools'

describe('tools', () => {
  describe('calcPrice', () => {
    const testCases = [
      [[100, 100], [0.5, 0.5]],
      [[150, 50], [0.25, 0.75]],
      [[50, 150], [0.75, 0.25]],
      [[100, 100, 100], [0.3333, 0.3333, 0.3333]],
      [[200, 100, 100], [0.2, 0.4, 0.4]],
      [[100, 200, 100], [0.4, 0.2, 0.4]],
      [[100, 100, 200], [0.4, 0.4, 0.2]],
      [[100, 200, 300], [0.5454, 0.2727, 0.1818]],
    ]

    for (const [holdings, expectedResult] of testCases) {
      it(`should compute the right price`, () => {
        const holdingsBN = holdings.map(bigNumberify)
        const prices = calcPrice(holdingsBN)

        prices.forEach((price, index) => expect(price).toBeCloseTo(expectedResult[index]))
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
        const fundingBN = bigNumberify(funding)
        const tradeYesBN = bigNumberify(tradeYes)
        const tradeNoBN = bigNumberify(tradeNo)
        const result = calcNetCost(fundingBN, priceYes, tradeYesBN, priceNo, tradeNoBN).toNumber()

        expect(result).toBeCloseTo(expectedResult)
      })
    }
  })

  describe('calcDistributionHint', () => {
    const testCases = [
      [[50, 50], [1000000, 1000000]],
      [[60, 40], [816497, 1224745]],
      [[40, 60], [1224745, 816497]],
      [[15, 20, 65], [9309493, 6982120, 2148345]],
      [[15, 65, 20], [9309493, 2148345, 6982120]],
      [[20, 15, 65], [6982120, 9309493, 2148345]],
      [[20, 65, 15], [6982120, 2148345, 9309493]],
      [[65, 20, 15], [2148345, 6982120, 9309493]],
      [[65, 15, 20], [2148345, 9309493, 6982120]],
      [[10, 10, 10, 70], [26457513, 26457513, 26457513, 3779645]],
      [[10, 10, 70, 10], [26457513, 26457513, 3779645, 26457513]],
      [[10, 70, 10, 10], [26457513, 3779645, 26457513, 26457513]],
      [[70, 10, 10, 10], [3779645, 26457513, 26457513, 26457513]],
    ]

    for (const [odds, expectedHintsNumbers] of testCases) {
      it(`should compute the right distribution hint`, () => {
        const distributionHints = calcDistributionHint(odds).map(x => new Big(x.toString()))

        const distributionHintsMax = distributionHints.reduce((a, b) => (a.gt(b) ? a : b))
        const distributionHintsScaled = distributionHints.map(dh => dh.div(distributionHintsMax))

        const expectedHints = expectedHintsNumbers.map(x => new Big(x))
        const expectedHintsMax = expectedHints.reduce((a, b) => (a.gt(b) ? a : b))
        const expectedHintsScaled = expectedHints.map(eh => eh.div(expectedHintsMax))

        distributionHintsScaled.forEach((dh, i) =>
          expect(+dh.div(new Big(expectedHintsScaled[i])).toFixed()).toBeCloseTo(1),
        )
      })
    }
  })

  describe('calcSellAmountInCollateral', () => {
    const testCases: any = [
      [['502512562814070351', '2000000000000000000', '669745046301742827'], '500000000000000000'],
      [['1502512562814070351', '673378000740715800', '365128583991411574'], '100000000000000000'],
      [['673378000740715800', '1502512562814070351', '148526984259244846'], '100000000000000000'],
    ]

    for (const [
      [holdingsOfSoldOutcome, holdingsOfOtherOutcome, sharesSold],
      expected,
    ] of testCases) {
      it(`should compute the amount of collateral to sell`, () => {
        const result = calcSellAmountInCollateral(
          bigNumberify(holdingsOfSoldOutcome),
          bigNumberify(holdingsOfOtherOutcome),
          bigNumberify(sharesSold),
          0.01,
        )

        expect(divBN(result, bigNumberify(expected))).toBeCloseTo(1)
      })
    }
  })

  describe('getIndexSets', () => {
    const testCases: any = [[3, [1, 2, 4]], [4, [1, 2, 4, 8]], [5, [1, 2, 4, 8, 16]]]

    for (const [outcomesCount, expected] of testCases) {
      it(`should get the correct indexSet`, () => {
        const result = getIndexSets(outcomesCount)

        expect(result).toStrictEqual(expected)
      })
    }
  })
})
