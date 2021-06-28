import Big from 'big.js'
import { BigNumber, bigNumberify } from 'ethers/utils'

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
/**
 * Computes the distribution hint that should be used for setting the initial odds to `initialOdds`
 * @param initialOdds - an array of numbers proportional to the initial estimate of the probability of each outcome
 */
export const calcDistributionHint = (initialOdds: number[]): BigNumber[] => {
  const allEqual = initialOdds.every(x => x === initialOdds[0])
  if (allEqual) {
    return []
  }
  const initialOddsBig = initialOdds.map(x => new Big(x))
  const product = initialOddsBig.reduce((a, b) => a.mul(b))

  const distributionHint = initialOddsBig
    .map(o => product.div(o))
    .map(x => x.mul(1000000).round())
    .map(x => bigNumberify(x.toString()))

  return distributionHint
}
/**
 * Compute the number of outcome tokens that will be sent to the user by the market maker after funding it for the first time with `addedFunds` of collateral.
 * @dev The distribution hint plays the role of the pool's balances so we can just forward this to calcAddFundingSendAmounts
 * @param addedFunds - the amount of collateral being added to the market maker as liquidity
 * @param distributionHint - a distribution hint as calculated by `calcDistributionHint`
 */
export const calcInitialFundingSendAmounts = (
  addedFunds: BigNumber,
  distributionHint: BigNumber[],
): Maybe<BigNumber[]> => calcAddFundingSendAmounts(addedFunds, distributionHint)

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
/**
 * Compute the number of outcome tokens that will be sent to the user by the Market Maker
 * after removing `removedFunds` of pool shares.
 * @param removedFunds - the amount of liquidity pool tokens being sent to the market maker in return for underlying outcome tokens
 * @param poolBalances - the market maker's balances of outcome tokens
 * @param poolShareSupply - the total supply of liquidity pool tokens
 */
export const calcRemoveFundingSendAmounts = (
  removedFunds: BigNumber,
  holdingsBN: BigNumber[],
  poolShareSupply: BigNumber,
): BigNumber[] => {
  const sendAmounts = holdingsBN.map(h =>
    poolShareSupply.gt(0) ? h.mul(removedFunds).div(poolShareSupply) : new BigNumber(0),
  )
  return sendAmounts
}
/**
 * Compute the numbers of outcome tokens that will be added to the market maker after adding `addedFunds` of collateral.
 * @dev The distribution hint plays the role of the pool's balances so we can just forward this to calcAddFundingSendAmounts
 * @param addedFunds - the amount of collateral being added to the market maker as liquidity
 * @param poolBalances - the market maker's balances of outcome tokens
 */
export const calcInitialFundingDepositedAmounts = (
  addedFunds: BigNumber,
  distributionHint: BigNumber[],
): BigNumber[] => {
  if (distributionHint.some(x => x.isZero())) {
    throw new Error("Invalid Distribution Hint - can't assign a weight of zero to an outcome")
  }
  return calcAddFundingDepositedAmounts(addedFunds, distributionHint)
}
export const calcSharesBought = (
  poolShares: BigNumber,
  balances: BigNumber[],
  shares: BigNumber[],
  collateralTokenAmount: BigNumber,
) => {
  const sendAmountsAfterAddingFunding = calcAddFundingSendAmounts(collateralTokenAmount, balances, poolShares)

  const sharesAfterAddingFunding = sendAmountsAfterAddingFunding
    ? shares.map((balance, i) => balance.add(sendAmountsAfterAddingFunding[i]))
    : shares.map(share => share)

  const sendAmountsAfterRemovingFunding = calcRemoveFundingSendAmounts(collateralTokenAmount, balances, poolShares)
  const depositedTokens = sendAmountsAfterRemovingFunding.reduce((min: BigNumber, amount: BigNumber) =>
    amount.lt(min) ? amount : min,
  )
  const sharesAfterRemovingFunding = shares.map((share, i) => {
    return share.add(sendAmountsAfterRemovingFunding[i]).sub(depositedTokens)
  })

  return sharesAfterAddingFunding[0].sub(sharesAfterRemovingFunding[0])
}
