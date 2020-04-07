import { newtonRaphson } from '@fvictorio/newton-raphson-method'
import Big from 'big.js'
import { BigNumber, bigNumberify, formatUnits, getAddress } from 'ethers/utils'
import moment from 'moment'

import { getLogger } from './logger'

const logger = getLogger('Tools')

export const truncateStringInTheMiddle = (str: string, strPositionStart: number, strPositionEnd: number) => {
  const minTruncatedLength = strPositionStart + strPositionEnd
  if (minTruncatedLength < str.length) {
    return `${str.substr(0, strPositionStart)}...${str.substr(str.length - strPositionEnd, str.length)}`
  }
  return str
}

export const formatDate = (date: Date): string => {
  return moment(date).format('lll')
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

  const hasZeroHoldings = holdings.every(h => h.toString() === '0')
  if (hasZeroHoldings) {
    return holdings.map(() => 0)
  }

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
  if (outcomeIndex < 0 || outcomeIndex >= holdings.length) {
    throw new Error(`Outcome index '${outcomeIndex}' must be between 0 and '${holdings.length}' - 1`)
  }

  return holdings.map((h, i) => {
    return h.add(amountCollateralSpent).sub(i === outcomeIndex ? amountShares : bigNumberify(0))
  })
}

/**
 * Computes the distribution hint that should be used for setting the initial odds to `initialOdds`
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
 * Computes the amount of collateral that needs to be sold to get `shares` amount of shares. Returns null if the amount
 * couldn't be computed.
 *
 * @param sharesToSell The amount of shares that need to be sold
 * @param holdings How many tokens the market maker has of the outcome that is being sold
 * @param otherHoldings How many tokens the market maker has of the outcomes that are not being sold
 * @param fee The fee of the market maker, between 0 and 1
 */
export const calcSellAmountInCollateral = (
  sharesToSell: BigNumber,
  holdings: BigNumber,
  otherHoldings: BigNumber[],
  fee: number,
): Maybe<BigNumber> => {
  Big.DP = 90

  const sharesToSellBig = new Big(sharesToSell.toString())
  const holdingsBig = new Big(holdings.toString())
  const otherHoldingsBig = otherHoldings.map(x => new Big(x.toString()))

  const f = (r: Big) => {
    const numerator = otherHoldingsBig.reduce((a, b) => a.mul(b), holdingsBig)
    const denominator = otherHoldingsBig.map(h => h.minus(r).minus(r.mul(fee))).reduce((a, b) => a.mul(b))
    return holdingsBig
      .minus(r)
      .plus(sharesToSellBig)
      .minus(numerator.div(denominator))
  }

  const r = newtonRaphson(f, 0)

  if (r) {
    const amountToSell = bigNumberify(r.toFixed(0))
    return amountToSell
  }

  return null
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

export const calcPoolTokens = (
  addedFunds: BigNumber,
  holdingsBN: BigNumber[],
  poolShareSupply: BigNumber,
): BigNumber => {
  if (poolShareSupply.gt(0)) {
    const poolWeight = holdingsBN.reduce((max: BigNumber, h: BigNumber) => (h.gt(max) ? h : max))

    return addedFunds.mul(poolShareSupply).div(poolWeight)
  } else {
    return addedFunds
  }
}

export const calcDepositedTokens = (
  removedFunds: BigNumber,
  holdingsBN: BigNumber[],
  poolShareSupply: BigNumber,
): BigNumber => {
  const sendAmounts = holdingsBN.map(h => h.mul(removedFunds).div(poolShareSupply))
  return sendAmounts.reduce((min: BigNumber, amount: BigNumber) => (amount.lt(min) ? amount : min))
}

/**
 * Like Promise.all but for objects.
 *
 * Example:
 *   promiseProps({ a: 1, b: Promise.resolve(2) }) resolves to { a: 1, b: 2 }
 */
export async function promiseProps<T>(obj: { [K in keyof T]: Promise<T[K]> | T[K] }): Promise<T> {
  const keys = Object.keys(obj)
  const values = await Promise.all(Object.values(obj))
  const result: any = {}
  for (let i = 0; i < values.length; i++) {
    result[keys[i]] = values[i]
  }

  return result
}
