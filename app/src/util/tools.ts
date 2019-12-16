import Big from 'big.js'
import { BigNumber, getAddress, bigNumberify, formatUnits } from 'ethers/utils'

import { getLogger } from './logger'

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
 * Computes the price of each outcome token given their holdings. Returns an array of numbers in the range [0, 1]
 */
export const calcPrice = (holdingsBN: BigNumber[]): number[] => {
  const holdings = holdingsBN.map(h => new Big(h.toString()))
  const product = holdings.reduce((a, b) => a.mul(b))
  const denominator = holdings.map(h => product.div(h)).reduce((a, b) => a.add(b))

  const prices = holdings.map(holding => product.div(holding).div(denominator))

  return prices.map(price => +price.valueOf())
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
 * Computes the balances of the outcome tokens after trading
 */
export const computeBalanceAfterTrade = (
  holdings: BigNumber[],
  outcomeIndex: number, // Outcome selected
  amountCollateralSpent: BigNumber, // Amount of collateral being spent
  amountShares: BigNumber, // amount of `outcome` shares being traded
): BigNumber[] => {
  // TODO: refactor this, calculate balance after trade

  return []
}

/**
 * Computes the distribution hint that should be used for setting the initial odds to `initialOdds`
 */
export const calcDistributionHint = (initialOdds: number[]): BigNumber[] => {
  const initialOddsBig = initialOdds.map(x => new Big(x))
  const product = initialOddsBig.reduce((a, b) => a.mul(b))

  const distributionHint = initialOddsBig
    .map(o => product.div(o))
    .map(x => x.mul(1000000).round())
    .map(x => bigNumberify(x.toString()))

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

export const delay = (timeout: number) => new Promise(res => setTimeout(res, timeout))

export const getIndexSets = (outcomesCount: number) => {
  const range = (length: number) => [...Array(length)].map((x, i) => i)
  return range(outcomesCount).map(x => 1 << x)
}
