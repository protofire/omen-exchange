import Big from 'big.js'
import { BigNumber, getAddress, bigNumberify, formatUnits } from 'ethers/utils'

import { getLogger } from './logger'
import { OutcomeSlot } from './types'

const logger = getLogger('Tools')

export const truncateStringInTheMiddle = (
  str: string,
  strLength = 41,
  strPositionStart = 8,
  strPositionEnd = 8,
) => {
  if (str.length > strLength) {
    return `${str.substr(0, strPositionStart)}...${str.substr(
      str.length - strPositionEnd,
      str.length,
    )}`
  }
  return str
}

export const formatDate = (date: Date): string => {
  const dateParts = date.toString().split(/\s+/)
  return dateParts.slice(1, 6).join(' ')
}

export const divBN = (a: BigNumber, b: BigNumber, scale = 10000): number => {
  return (
    a
      .mul(scale)
      .div(b)
      .toNumber() / scale
  )
}

export const mulBN = (a: BigNumber, b: number, scale = 10000): BigNumber => {
  return a.mul(Math.round(b * scale)).div(scale)
}

/**
 * Computes the price of some outcome tokens, given the initial funding and the current holdings.
 */
export const calcPrice = (funding: BigNumber, holdings: BigNumber) => {
  // 2^(-holding / funding)
  return Math.pow(2, -divBN(holdings, funding))
}

/**
 * Computes the cost in collateral of trading `tradeYes` and `tradeNo` outcomes, given that the initial funding is
 * `funding` and the current prices.
 */
export const calcNetCost = (
  funding: BigNumber,
  priceYes: number,
  tradeYes: BigNumber,
  priceNo: number,
  tradeNo: BigNumber,
): BigNumber => {
  // funding * (offset + log2(oddYes * (2^(tradeYes / funding - offset)) + oddNo * (2^(tradeNo / funding) - offset))
  const offset = Math.max(divBN(tradeYes, funding), divBN(tradeNo, funding))

  const logTerm =
    offset +
    Math.log2(
      priceYes * Math.pow(2, divBN(tradeYes, funding) - offset) +
        priceNo * Math.pow(2, divBN(tradeNo, funding) - offset),
    )
  return mulBN(funding, logTerm)
}

/**
 * Computes the balance of the outcome tokens after trading
 */
export const computeBalanceAfterTrade = (
  holdingsYes: BigNumber,
  holdingsNo: BigNumber,
  outcome: OutcomeSlot, // Outcome selected
  amountCollateralSpent: BigNumber, // Amount of collateral being spent
  amountShares: BigNumber, // amount of `outcome` shares being traded
): { balanceOfForYes: BigNumber; balanceOfForNo: BigNumber } => {
  let balanceOfForYes = holdingsYes.add(amountCollateralSpent)
  let balanceOfForNo = holdingsNo.add(amountCollateralSpent)

  if (outcome === OutcomeSlot.Yes) {
    balanceOfForYes = balanceOfForYes.sub(amountShares)
  } else {
    balanceOfForNo = balanceOfForNo.sub(amountShares)
  }

  return { balanceOfForYes, balanceOfForNo }
}

/**
 * Computes the distribution hint that should be used for setting the initial odds to `initialOddsYes`
 * and `initialOddsNo`
 */
export const calcDistributionHint = (
  initialOddsYes: number,
  initialOddsNo: number,
): BigNumber[] => {
  const distributionHintYes = Math.sqrt(initialOddsNo / initialOddsYes)
  const distributionHintNo = Math.sqrt(initialOddsYes / initialOddsNo)

  const distributionHint = [distributionHintYes, distributionHintNo]
    .map(hint => Math.round(hint * 1000000))
    .map(bigNumberify)

  return distributionHint
}

/**
 * Computes the amount of collateral that needs to be sold to get `shares` amount of shares.
 *
 * @param holdingsOfSoldOutcome How many tokens the market maker has of the outcome that is being sold
 * @param holdingsOfOtherOutcome How many tokens the market maker has of the outcome that is not being sold
 * @param shares The amount of shares that need to be sold
 * @param fee The fee of the market maker, between 0 and 1
 */
export const calcSellAmountInCollateral = (
  holdingsOfSoldOutcome: BigNumber,
  holdingsOfOtherOutcome: BigNumber,
  shares: BigNumber,
  fee: number,
): BigNumber => {
  Big.DP = 90

  const x = new Big(holdingsOfOtherOutcome.toString())
  const y = new Big(holdingsOfSoldOutcome.toString())
  const a = new Big(shares.toString())
  const f = new Big(fee)
  const termInsideSqrt = a
    .pow(2)
    .mul(f.pow(2))
    .add(
      a
        .pow(2)
        .mul(f)
        .mul(2),
    )
    .add(a.pow(2))
    .add(
      a
        .mul(f.pow(2))
        .mul(y)
        .mul(2),
    )
    .minus(
      a
        .mul(f)
        .mul(x)
        .mul(2),
    )
    .add(
      a
        .mul(f)
        .mul(y)
        .mul(4),
    )
    .minus(a.mul(x).mul(2))
    .add(a.mul(y).mul(2))
    .add(f.pow(2).mul(y.pow(2)))
    .add(
      f
        .mul(x)
        .mul(y)
        .mul(2),
    )
    .add(f.mul(y.pow(2)).mul(2))
    .add(x.pow(2))
    .add(x.mul(y).mul(2))
    .add(y.pow(2))

  const amountToSellBig = termInsideSqrt
    .sqrt()
    .mul(-1)
    .add(a.mul(f))
    .add(a)
    .add(f.mul(y))
    .add(x)
    .add(y)
    .div(f.add(1).mul(2))

  const amountToSell = bigNumberify(amountToSellBig.toFixed(0))

  return amountToSell
}

export const isAddress = (address: string): boolean => {
  try {
    getAddress(address)
  } catch (e) {
    logger.log(`Address '${address}' doesn't exist`)
    return false
  }
  return true
}

export const formatBigNumber = (value: BigNumber, decimals: number, precision = 2): string =>
  Number(formatUnits(value, decimals)).toFixed(precision)

export const isContract = async (provider: any, address: string): Promise<boolean> => {
  const code = await provider.getCode(address)
  return code && code !== '0x'
}
