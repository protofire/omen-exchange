import { BigNumber } from 'ethers/utils'

import { calcSharesBought } from '../calcSharesBought'

describe('calcSharesBought', () => {
  const testCases: [[number, number[], number[], number], number][] = [
    [[205, [200, 211], [36, 67], 1], 1],
    [[204, [193, 216], [48, 67], 1], 1],
    [[203, [192, 215], [48, 67], 50], 6],
  ]
  for (const [[poolShares, [balanceOne, balanceTwo], [sharesOne, sharesTwo], collateral], result] of testCases) {
    const poolSharesBig = new BigNumber(poolShares)
    const balanceOneBig = new BigNumber(balanceOne)
    const balanceTwoBig = new BigNumber(balanceTwo)
    const sharesOneBig = new BigNumber(sharesOne)
    const sharesTwoBig = new BigNumber(sharesTwo)
    const collateralBig = new BigNumber(collateral)
    const resultBig = new BigNumber(result)
    const calculation = calcSharesBought(
      poolSharesBig,
      [balanceOneBig, balanceTwoBig],
      [sharesOneBig, sharesTwoBig],
      collateralBig,
    )
    expect(calculation.toNumber()).toBeCloseTo(resultBig.toNumber())
  }
})
