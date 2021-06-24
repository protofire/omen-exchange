import { BigNumber, bigNumberify } from 'ethers/utils'
//stays
/**
 * Computes the market maker's balances of outcome tokens after a trade
 *
 * @dev It is recommended to use the methods `computeBalanceAfterSharePurchase` and `computeBalanceAfterShareSale` instead of this
 *
 * @param initialPoolBalances - the market maker's balances of outcome tokens before the trade
 * @param outcomeIndex - the index of the outcome token being bought
 * @param investmentAmountAfterFees - the amount of collateral being converted into outcome tokens (i.e. post fees)
 * @param sharesBoughtAmount - the amount of outcome tokens being removed from the market maker
 */
export const computeBalanceAfterTrade = (
  holdings: BigNumber[],
  outcomeIndex: number, // Outcome selected
  amountCollateralSpent: BigNumber, // Amount of collateral being spent
  amountShares: BigNumber, // amount of `outcome` shares being traded
): BigNumber[] => {
  if (outcomeIndex < 0 || outcomeIndex >= holdings.length) {
    throw new Error(`Outcome index '${outcomeIndex}' must be between 0 and '${holdings.length}' - 1`)
  }

  const newPoolBalances = holdings.map((h, i) => {
    return h.add(amountCollateralSpent).sub(i === outcomeIndex ? amountShares : bigNumberify(0))
  })
  if (newPoolBalances.some(balance => balance.lte(0))) {
    throw new Error(`Trade is invalid: trade results in liquidity pool owning a negative number of tokens`)
  }
  return newPoolBalances
}
