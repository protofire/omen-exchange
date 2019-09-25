/* eslint-env jest */
import { ethers } from 'ethers'
import { computeInitialTradeOutcomeTokens } from './tools'

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
})
