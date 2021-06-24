import { WeiPerEther } from 'ethers/constants'
import { BigNumber } from 'ethers/utils'

import { ceilDiv, mulBN } from '../../utils'

/**
 * Computes the amount of shares that will be bought with `investmentAmount` amount collateral.
 *
 * @param investmentAmount The amount of collateral being put into the market maker
 * @param outcomeIndex The index of the outcome being bought
 * @param poolBalances How many tokens the market maker has of each outcome
 * @param fee The fee of the market maker, between 0 and 1
 */
export const calcBuyAmountInShares = (
  investmentAmount: BigNumber,
  outcomeIndex: number,
  poolBalances: BigNumber[],
  fee: number,
): BigNumber => {
  if (outcomeIndex < 0 || outcomeIndex >= poolBalances.length) {
    throw new Error(`Outcome index '${outcomeIndex}' must be between 0 and '${poolBalances.length - 1}'`)
  }
  if (investmentAmount.isZero() || poolBalances.every(x => x.isZero())) return WeiPerEther

  const investmentAmountMinusFees = mulBN(investmentAmount, 1 - fee)
  const newOutcomeBalance = poolBalances.reduce(
    (accumulator: BigNumber, poolBalance, i) =>
      i !== outcomeIndex
        ? ceilDiv(accumulator.mul(poolBalance), poolBalance.add(investmentAmountMinusFees))
        : accumulator.mul(poolBalance),
    WeiPerEther,
  )

  return poolBalances[outcomeIndex].add(investmentAmountMinusFees).sub(ceilDiv(newOutcomeBalance, WeiPerEther))
}
