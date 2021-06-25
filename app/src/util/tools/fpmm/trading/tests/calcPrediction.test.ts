import { BigNumber, parseUnits } from 'ethers/utils'

import { calcPrediction } from '../index'

describe('calcPrediction', () => {
  const testCases: [[string, BigNumber, BigNumber], number][] = [
    [['0.04', parseUnits('0', 18), parseUnits('1', 18)], 0.04],
    [['0.5', parseUnits('5', 18), parseUnits('105', 18)], 55],
    [['0.75', parseUnits('3', 18), parseUnits('43', 18)], 33],
  ]
  for (const [[probability, lowerBound, upperBound], result] of testCases) {
    const prediction = calcPrediction(probability, lowerBound, upperBound)

    it('calculates correctly', () => {
      expect(prediction).toStrictEqual(result)
    })
  }
})
