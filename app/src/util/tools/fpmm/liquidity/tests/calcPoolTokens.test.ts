/* eslint-env jest */
import { bigNumberify } from 'ethers/utils'

import { calcPoolTokens } from '../index'

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
