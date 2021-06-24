import { BigNumber } from 'ethers/utils'

import { calcAddFundingSendAmounts } from './calcAddFundingSendAmounts'

/**
 * Compute the number of outcome tokens that will be sent to the user by the market maker after funding it for the first time with `addedFunds` of collateral.
 * @dev The distribution hint plays the role of the pool's balances so we can just forward this to calcAddFundingSendAmounts
 * @param addedFunds - the amount of collateral being added to the market maker as liquidity
 * @param distributionHint - a distribution hint as calculated by `calcDistributionHint`
 */
export const calcInitialFundingSendAmounts = (addedFunds: BigNumber, distributionHint: BigNumber[]): BigNumber[] =>
  calcAddFundingSendAmounts(addedFunds, distributionHint)
