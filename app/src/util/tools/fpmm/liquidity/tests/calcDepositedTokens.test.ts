import { Zero } from 'ethers/constants'
import { bigNumberify } from 'ethers/utils'

import { calcDepositedTokens } from '../calcDepositedTokens'

describe('calcDepositedTokens', () => {
  it('returns min of holdings mapped to factor', () =>
    expect(calcDepositedTokens(bigNumberify(20), [1, 2, 3].map(bigNumberify), bigNumberify(2))).toStrictEqual(
      bigNumberify(10),
    ))

  describe('when no holdings', () => {
    it('returns 0', () =>
      expect(calcDepositedTokens(bigNumberify(20), [100, 20, 0].map(bigNumberify), bigNumberify(10))).toStrictEqual(
        Zero,
      ))
  })

  describe('when no funding', () => {
    it('returns 0', () =>
      expect(calcDepositedTokens(bigNumberify(20), [100, 200, 300].map(bigNumberify), bigNumberify(0))).toStrictEqual(
        Zero,
      ))
  })
})
