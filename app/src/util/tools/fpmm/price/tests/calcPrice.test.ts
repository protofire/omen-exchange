/* eslint-env jest */
import { calcPrice } from '../index'

const testCases: [number[], number[]][] = [
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

describe('calcPrice', () => {
  it.each(testCases)(`should compute the right price`, (balances, expectedPrices) => {
    const prices = calcPrice(balances)

    prices.forEach((price, index) => expect(price).toBeCloseTo(expectedPrices[index]))
  })
})
