import { BigNumber } from 'ethers/utils'
import { TokenAmountInterface } from './types'

class TokenAmount implements TokenAmountInterface {
  public amount: BigNumber
  public decimals: number

  public static fromString(value: string, decimals: number) {
    const parts = value.split('.')
    const integer = parts[0]
    const fractional = (parts[1] || '0').slice(0, decimals).padEnd(decimals, '0')

    const scale = new BigNumber(10).pow(new BigNumber(decimals))

    const amount = new BigNumber(integer).mul(scale).add(new BigNumber(fractional))

    return new TokenAmount(amount, decimals)
  }

  public static format(amount: BigNumber, decimals: number, precision = 4) {
    const scale = new BigNumber(10).pow(new BigNumber(decimals))
    const integer = amount.div(scale).toString()
    const fractional = amount
      .mod(scale)
      .toString()
      .padStart(decimals, '0')
      .slice(0, precision)

    return `${integer}.${fractional}`
  }

  constructor(amount: BigNumber, decimals: number) {
    this.amount = amount
    this.decimals = decimals
  }

  public format(precision = 4) {
    return TokenAmount.format(this.amount, this.decimals, precision)
  }
}

export { TokenAmount }
