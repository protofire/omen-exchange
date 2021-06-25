import { BigNumber } from 'ethers/utils'

import { calcRemoveFundingSendAmounts } from './calcRemoveFundingSendAmounts'
//stays check
/**
 * Compute the amount of collateral that can be obtained via merging after the user
 * removed `removedFunds` of pool shares.
 * @param removedFunds - the amount of liquidity pool tokens being sent to the market maker in return for underlying outcome tokens
 * @param poolBalances - the market maker's balances of outcome tokens
 * @param poolShareSupply - the total supply of liquidity pool tokens
 */
export const calcDepositedTokens = (
  removedFunds: BigNumber,
  poolBalances: BigNumber[],
  poolShareSupply: BigNumber,
): BigNumber => {
  const sendAmounts = calcRemoveFundingSendAmounts(removedFunds, poolBalances, poolShareSupply)
  return sendAmounts.reduce((min, amount) => (amount.lt(min) ? amount : min))
}
