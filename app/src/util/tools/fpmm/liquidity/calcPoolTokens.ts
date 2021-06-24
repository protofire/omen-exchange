import { BigNumber } from 'ethers/utils'
//stays
/**
 * Compute the number of liquidity pool tokens that will be sent to the user by the Market Maker
 * after adding `addedFunds` of collateral.
 * @param addedFunds - the amount of collateral being added to the market maker as liquidity
 * @param poolBalances - the market maker's balances of outcome tokens
 * @param poolShareSupply - the total supply of liquidity pool tokens
 */
export const calcPoolTokens = (
  addedFunds: BigNumber,
  holdingsBN: BigNumber[],
  poolShareSupply: BigNumber,
): BigNumber => {
  if (poolShareSupply.gt(0) && holdingsBN.length > 0) {
    const poolWeight = holdingsBN.reduce((max: BigNumber, h: BigNumber) => (h.gt(max) ? h : max))

    return addedFunds.mul(poolShareSupply).div(poolWeight)
  } else {
    return addedFunds
  }
}
