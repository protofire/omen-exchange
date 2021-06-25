/* eslint-env jest */
import Big from 'big.js'

import { calcDistributionHint } from '../calcDistributionHint'

const testCases: [number[], number[]][] = [
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

describe('calcDistributionHint', () => {
  it.each(testCases)(`should compute the right distribution hint`, (odds, expectedHintsNumbers) => {
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

  describe('when all the odds are equal', () => {
    const testCasesEqual: [number[]][] = [[[50, 50]], [[100 / 3, 100 / 3, 100 / 3]]]
    it.each(testCasesEqual)('returns an empty array', distribution => {
      expect(calcDistributionHint(distribution)).toEqual([])
    })
  })
})
