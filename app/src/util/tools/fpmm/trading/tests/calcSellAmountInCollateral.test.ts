/* eslint-env jest */
import { BigNumber, bigNumberify } from 'ethers/utils'

import { divBN } from '../../../maths'
import { calcSellAmountInCollateral } from '../index'

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
