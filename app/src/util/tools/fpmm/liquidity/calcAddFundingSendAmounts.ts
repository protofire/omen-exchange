import { BigNumber } from 'ethers/utils'

import { calcAddFundingDepositedAmounts } from './calcAddFundingDepositedAmounts'

/**
 * Compute the numbers of outcome tokens that will be sent to the user by the market maker after adding `addedFunds` of collateral.
 * @param addedFunds - the amount of collateral being added to the market maker as liquidity
 * @param poolBalances - the market maker's balances of outcome tokens
 */
export const calcAddFundingSendAmounts = (
  addedFunds: BigNumber,
  poolBalances: BigNumber[],
  poolShareSupply?: BigNumber,
): Maybe<BigNumber[]> => {
  if (poolShareSupply && poolShareSupply.eq(0)) {
    return null
  }
  const depositAmounts = calcAddFundingDepositedAmounts(addedFunds, poolBalances)

  const sendAmounts = depositAmounts.map(depositAmount => addedFunds.sub(depositAmount))
  return sendAmounts
}
