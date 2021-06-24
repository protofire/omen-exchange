import { newtonRaphson } from '@fvictorio/newton-raphson-method'
import Big from 'big.js'
import { BigNumber, bigNumberify } from 'ethers/utils'
//stays
/**
 * Computes the amount of collateral that needs to be sold to get `shares` amount of shares. Returns null if the amount
 * couldn't be computed.
 *
 * @param sharesToSell The amount of shares that need to be sold
 * @param outcomeIndex The index of the outcome being bought
 * @param poolBalances How many tokens the market maker has of each outcome
 * @param fee The fee of the market maker, between 0 and 1
 */
export const calcSellAmountInCollateral = (
  sharesToSell: BigNumber,
  holdings: BigNumber,
  otherHoldings: BigNumber[],
  fee: number,
): Maybe<BigNumber> => {
  Big.DP = 90
  const sharesToSellBig = new Big(sharesToSell.toString())
  const holdingsBig = new Big(holdings.toString())
  const otherHoldingsBig = otherHoldings.map(x => new Big(x.toString()))

  const f = (r: Big) => {
    // For three outcomes, where the first outcome is the one being sold, the formula is:
    // f(r) = ((y - R) * (z - R)) * (x  + a - R) - x*y*z
    // where:
    //   `R` is r / (1 - fee)
    //   `x`, `y`, `z` are the market maker holdings for each outcome
    //   `a` is the amount of outcomes that are being sold
    //   `r` (the unknown) is the amount of collateral that will be returned in exchange of `a` tokens
    const R = r.div(1 - fee)
    const firstTerm = otherHoldingsBig.map(h => h.minus(R)).reduce((a, b) => a.mul(b))
    const secondTerm = holdingsBig.plus(sharesToSellBig).minus(R)
    const thirdTerm = otherHoldingsBig.reduce((a, b) => a.mul(b), holdingsBig)
    return firstTerm.mul(secondTerm).minus(thirdTerm)
  }

  const r = newtonRaphson(f, 0, { maxIterations: 100 })

  if (r) {
    const amountToSell = bigNumberify(r.toFixed(0))
    return amountToSell
  }

  return null
}
