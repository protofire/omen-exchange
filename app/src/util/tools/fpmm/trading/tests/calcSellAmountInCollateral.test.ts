/* eslint-env jest */
import { BigNumber, bigNumberify } from 'ethers/utils'

import { divBN } from '../../../utils'
import { calcSellAmountInCollateral } from '../calcSellAmountInCollateral'

const testCases: [[string, number, string[], number], string][] = [
  [['669745046301742827', 0, ['502512562814070351', '2000000000000000000'], 0.01], '496532989893612286'],
  [['669745046301742827', 1, ['2000000000000000000', '502512562814070351'], 0.01], '496532989893612286'],

  [['365128583991411574', 0, ['1502512562814070351', '673378000740715800'], 0.01], '100000000000000000'],
  [['148526984259244846', 0, ['673378000740715800', '1502512562814070351'], 0.01], '99336468831519624'],
  [
    [
      '169611024591650211',
      2,
      ['1500000000000000000', '1500000000000000000', '299279122636316870', '1500000000000000000'],
      0.01,
    ],
    '99437054864518193',
  ],
  [
    ['18399816000000000000', 2, ['11009048601975904608', '17551468438676294710', '139733493703807763'], 0.01],
    '10381992534881175324',
  ],
  [['200000', 1, ['100000', '100000', '100000'], 0.01], '37815'],
  [['100000000', 0, ['18023', '156155227'], 0.02], '97968575'],
  [['1000000000', 0, ['18023', '156155227'], 0.02], '153028854'],
]

describe('calcSellAmountInCollateral', () => {
  it.each(testCases)(
    `should compute the amount of collateral to sell`,
    ([sharesToSell, outcomeIndex, poolBalances, fee], expected) => {
      const result = calcSellAmountInCollateral(
        bigNumberify(sharesToSell),
        bigNumberify(outcomeIndex),
        poolBalances.map(bigNumberify),
        fee,
      )

      expect(result).not.toBe(null)

      expect(divBN(result as BigNumber, bigNumberify(expected))).toBeCloseTo(1)
    },
  )
})
