import { BigNumber } from 'ethers/utils'

/**
 * Compute the numbers of outcome tokens that will be added to the market maker after adding `addedFunds` of collateral.
 * @param addedFunds - the amount of collateral being added to the market maker as liquidity
 * @param poolBalances - the market maker's balances of outcome tokens
 */
export const calcAddFundingDepositedAmounts = (addedFunds: BigNumber, poolBalances: BigNumber[]): BigNumber[] => {
  if (poolBalances.some(x => x.isZero())) {
    throw new Error(
      'Invalid Pool Balances - you must provide a distribution hint for the desired weightings of the pool',
    )
  }

  const poolWeight = poolBalances.reduce((a, b) => (a.gt(b) ? a : b))

  const depositAmounts = poolBalances.map(h => addedFunds.mul(h).div(poolWeight))

  return depositAmounts
}
