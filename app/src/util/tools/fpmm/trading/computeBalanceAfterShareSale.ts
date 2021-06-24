import { Zero } from 'ethers/constants'
import { BigNumber } from 'ethers/utils'

import { mulBN } from '../../utils'

import { computeBalanceAfterTrade } from './computeBalanceAfterTrade'

/**
 * Computes the market maker's balances of outcome tokens after a trade to sell shares of a particular outcome
 * @param initialPoolBalances - the market maker's balances of outcome tokens before the trade
 * @param outcomeIndex - the index of the outcome token being bought
 * @param returnAmountBeforeFees - the amount of collateral being converted into outcome tokens (i.e. post fees)
 * @param sharesSoldAmount - the amount of outcome tokens being removed from the market maker
 * @param fees - the percentage fees taken by the market maker on each trade
 */
export const computeBalanceAfterShareSale = (
  initialPoolBalances: BigNumber[],
  outcomeIndex: number,
  returnAmount: BigNumber,
  sharesSoldAmount: BigNumber,
  fees: number,
): BigNumber[] => {
  return computeBalanceAfterTrade(
    initialPoolBalances,
    outcomeIndex,
    fees !== 1 ? mulBN(returnAmount, 1 / (1 - fees)).mul(-1) : Zero,
    sharesSoldAmount.mul(-1),
  )
}
