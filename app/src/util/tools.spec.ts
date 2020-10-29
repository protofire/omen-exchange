/* eslint-env jest */
import Big from 'big.js'
import { BigNumber, bigNumberify } from 'ethers/utils'

import {
  calcAddFundingSendAmounts,
  calcDepositedTokens,
  calcDistributionHint,
  calcInitialFundingSendAmounts,
  calcNetCost,
  calcPoolTokens,
  calcPrice,
  calcSellAmountInCollateral,
  clampBigNumber,
  computeBalanceAfterTrade,
  divBN,
  formatNumber,
  getIndexSets,
  limitDecimalPlaces,
  truncateStringInTheMiddle as truncate,
} from './tools'

describe('tools', () => {
  describe('calcPrice', () => {
    const testCases = [
      [
        [100, 100],
        [0.5, 0.5],
      ],
      [
        [150, 50],
        [0.25, 0.75],
      ],
      [
        [50, 150],
        [0.75, 0.25],
      ],
      [
        [100, 100, 100],
        [0.3333, 0.3333, 0.3333],
      ],
      [
        [200, 100, 100],
        [0.2, 0.4, 0.4],
      ],
      [
        [100, 200, 100],
        [0.4, 0.2, 0.4],
      ],
      [
        [100, 100, 200],
        [0.4, 0.4, 0.2],
      ],
      [
        [100, 200, 300],
        [0.5454, 0.2727, 0.1818],
      ],
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
      [
        [60, 40],
        [816497, 1224745],
      ],
      [
        [40, 60],
        [1224745, 816497],
      ],
      [
        [15, 20, 65],
        [9309493, 6982120, 2148345],
      ],
      [
        [15, 65, 20],
        [9309493, 2148345, 6982120],
      ],
      [
        [20, 15, 65],
        [6982120, 9309493, 2148345],
      ],
      [
        [20, 65, 15],
        [6982120, 2148345, 9309493],
      ],
      [
        [65, 20, 15],
        [2148345, 6982120, 9309493],
      ],
      [
        [65, 15, 20],
        [2148345, 9309493, 6982120],
      ],
      [
        [10, 10, 10, 70],
        [26457513, 26457513, 26457513, 3779645],
      ],
      [
        [10, 10, 70, 10],
        [26457513, 26457513, 3779645, 26457513],
      ],
      [
        [10, 70, 10, 10],
        [26457513, 3779645, 26457513, 26457513],
      ],
      [
        [70, 10, 10, 10],
        [3779645, 26457513, 26457513, 26457513],
      ],
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

    it('should return an empty array when all the odds are equal', () => {
      expect(calcDistributionHint([50, 50])).toEqual([])
      expect(calcDistributionHint([100 / 3, 100 / 3, 100 / 3])).toEqual([])
    })
  })

  describe('calcSellAmountInCollateral', () => {
    const testCases: any = [
      [['669745046301742827', '502512562814070351', ['2000000000000000000']], '496532989893612286'],
      [['365128583991411574', '1502512562814070351', ['673378000740715800']], '100000000000000000'],
      [['148526984259244846', '673378000740715800', ['1502512562814070351']], '99336468831519624'],
      [
        [
          '169611024591650211',
          '299279122636316870',
          ['1500000000000000000', '1500000000000000000', '1500000000000000000'],
        ],
        '99437054864518193',
      ],
      [
        ['18399816000000000000', '139733493703807763', ['11009048601975904608', '17551468438676294710']],
        '10381992534881175324',
      ],
      [['200000', '100000', ['100000', '100000'], '0'], '37815'],
    ]

    for (const [[sharesToSell, holdings, otherHoldings], expected] of testCases) {
      it(`should compute the amount of collateral to sell`, () => {
        const result = calcSellAmountInCollateral(
          bigNumberify(sharesToSell),
          bigNumberify(holdings),
          otherHoldings.map(bigNumberify),
          0.01,
        )

        expect(result).not.toBe(null)

        expect(divBN(result as BigNumber, bigNumberify(expected))).toBeCloseTo(1)
      })
    }
  })

  describe('getIndexSets', () => {
    const testCases: any = [
      [3, [1, 2, 4]],
      [4, [1, 2, 4, 8]],
      [5, [1, 2, 4, 8, 16]],
    ]

    for (const [outcomesCount, expected] of testCases) {
      it(`should get the correct indexSet`, () => {
        const result = getIndexSets(outcomesCount)

        expect(result).toStrictEqual(expected)
      })
    }
  })

  describe('computeBalanceAfterTrade', () => {
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

    for (const [[holdings, outcomeIndex, collateral, shares], expected] of testCases) {
      it(`should compute the right balance after trade`, () => {
        const holdingsBN = holdings.map(bigNumberify)

        const result = computeBalanceAfterTrade(
          holdingsBN,
          outcomeIndex,
          bigNumberify(collateral),
          bigNumberify(shares),
        )

        result.forEach((x, i) => expect(x.toNumber()).toBeCloseTo(expected[i]))
      })
    }

    it('should throw if index is negative', () => {
      const holdings = [100, 100, 100].map(bigNumberify)
      expect(() => computeBalanceAfterTrade(holdings, -1, bigNumberify(50), bigNumberify(100))).toThrow()
    })

    it("should throw if index is equal to array's length", () => {
      const holdings = [100, 100, 100].map(bigNumberify)
      expect(() => computeBalanceAfterTrade(holdings, 3, bigNumberify(50), bigNumberify(100))).toThrow()
    })

    it("should throw if index is bigger than array's length", () => {
      const holdings = [100, 100, 100].map(bigNumberify)
      expect(() => computeBalanceAfterTrade(holdings, 10, bigNumberify(50), bigNumberify(100))).toThrow()
    })
  })

  describe('truncateStringInTheMiddle', () => {
    it('should not change string with truncate positions great or equal than string length', () => {
      expect(truncate('foobar', 4, 2)).toBe('foobar')
      expect(truncate('foobar', 6, 6)).toBe('foobar')
    })

    it('should truncate string with three dots in the middle', () => {
      expect(truncate('foobarbaz', 3, 2)).toBe('foo...az')
      expect(truncate('foobarbaz', 1, 1)).toBe('f...z')
    })
  })

  describe('calcPoolTokens', () => {
    it('should return addedFunds if poolShares are zero', () =>
      expect(calcPoolTokens(bigNumberify(20), [1, 2, 3].map(bigNumberify), bigNumberify(0))).toStrictEqual(
        bigNumberify(20),
      ))

    it('should return funds*supply/poolWeight', () =>
      expect(calcPoolTokens(bigNumberify(20), [1, 2, 3].map(bigNumberify), bigNumberify(2))).toStrictEqual(
        bigNumberify(13),
      ))
  })

  describe('calcDepositedTokens', () => {
    it('should return min of holdings mapped to factor', () =>
      expect(calcDepositedTokens(bigNumberify(20), [1, 2, 3].map(bigNumberify), bigNumberify(2))).toStrictEqual(
        bigNumberify(10),
      ))

    it('should return 0 with no holdings', () =>
      expect(calcDepositedTokens(bigNumberify(20), [100, 20, 0].map(bigNumberify), bigNumberify(10))).toStrictEqual(
        bigNumberify(0),
      ))

    it('should return 0 with no funding', () =>
      expect(calcDepositedTokens(bigNumberify(20), [100, 200, 300].map(bigNumberify), bigNumberify(0))).toStrictEqual(
        bigNumberify(0),
      ))
  })

  describe('calcAddFundingSendAmounts', () => {
    it('all holdings are different', () => {
      const result = calcAddFundingSendAmounts(bigNumberify(10), [1, 2, 3].map(bigNumberify), bigNumberify(20)).map(x =>
        x.toString(),
      )

      expect(result).toStrictEqual(['7', '4', '0'])
    })

    it('all holdings are equal', () => {
      const result = calcAddFundingSendAmounts(bigNumberify(10), [3, 3, 3].map(bigNumberify), bigNumberify(20)).map(x =>
        x.toString(),
      )

      expect(result).toStrictEqual(['0', '0', '0'])
    })

    it('no funding', () => {
      const result = calcAddFundingSendAmounts(bigNumberify(10), [3, 3, 3].map(bigNumberify), bigNumberify(0))

      expect(result).toBe(null)
    })
  })

  describe('calcInitialFundingSendAmounts', () => {
    it('all holdings are different', () => {
      const result = calcInitialFundingSendAmounts(bigNumberify(10), [1, 2, 3].map(bigNumberify)).map(x => x.toString())

      expect(result).toStrictEqual(['7', '4', '0'])
    })

    it('all holdings are equal', () => {
      const result = calcInitialFundingSendAmounts(bigNumberify(10), [3, 3, 3].map(bigNumberify)).map(x => x.toString())

      expect(result).toStrictEqual(['0', '0', '0'])
    })

    it('no funding', () => {
      const result = calcInitialFundingSendAmounts(bigNumberify(0), [3, 3, 3].map(bigNumberify)).map(x => x.toString())

      expect(result).toStrictEqual(['0', '0', '0'])
    })
  })

  describe('limitDecimalPlaces', () => {
    const testCases: [[string, number], number][] = [
      [['2.7598', 2], 2.75],
      [['3', 3], 3],
      [['4958.532334211132', 5], 4958.53233],
      [['0.001', 2], 0.0],
      [['0.7688', 3], 0.768],
      [['19.22', 2], 19.22],
      [['12.1', 2], 12.1],
    ]
    for (const [[value, decimals], result] of testCases) {
      it('should return the correct value', () => {
        const limitedValue = limitDecimalPlaces(value, decimals)

        expect(limitedValue).toStrictEqual(result)
      })
    }
  })

  describe('formatNumber', () => {
    const testCases: [[string, number], string][] = [
      [['1234567.8910', 2], '1,234,567.89'],
      [['0', 8], '0.00000000'],
      [['4269.123123222334', 0], '4,269'],
    ]
    for (const [[number, decimals], result] of testCases) {
      it('should return the correct numerical string', () => {
        const formattedNumber = formatNumber(number, decimals)

        expect(formattedNumber).toStrictEqual(result)
      })
    }
  })

  describe('clampBigNumber', () => {
    const testCases: [[BigNumber, BigNumber, BigNumber], BigNumber][] = [
      [[new BigNumber(0), new BigNumber(2), new BigNumber(7)], new BigNumber(2)],
      [[new BigNumber(1232), new BigNumber(0), new BigNumber(283)], new BigNumber(283)],
      [[new BigNumber(3), new BigNumber(1), new BigNumber(14)], new BigNumber(3)]
    ]
    for (const [[x, min, max], result] of testCases) {
      it('should return a clamped big number', () => {
        const clampedBigNumber = clampBigNumber(x, min, max)

        expect(clampedBigNumber).toStrictEqual(result)
      })
    }
  })
})
