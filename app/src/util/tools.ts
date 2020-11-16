import { newtonRaphson } from '@fvictorio/newton-raphson-method'
import Big from 'big.js'
import { BigNumber, bigNumberify, formatUnits, getAddress } from 'ethers/utils'
import moment from 'moment-timezone'

import { getLogger } from './logger'

const logger = getLogger('Tools')

// use floor as rounding method
Big.RM = 0

export const truncateStringInTheMiddle = (str: string, strPositionStart: number, strPositionEnd: number) => {
  const minTruncatedLength = strPositionStart + strPositionEnd
  if (minTruncatedLength < str.length) {
    return `${str.substr(0, strPositionStart)}...${str.substr(str.length - strPositionEnd, str.length)}`
  }
  return str
}

export const formatDate = (date: Date, utcAdd = true): string => {
  return moment(date)
    .tz('UTC')
    .format(`YYYY-MM-DD - HH:mm${utcAdd ? ' [UTC]' : ''}`)
}

export const convertUTCToLocal = (date: Maybe<Date>): Maybe<Date> => {
  if (!date) {
    return date
  }
  const offsetMinutes = moment(date).utcOffset()

  return moment(date)
    .subtract(offsetMinutes, 'minutes')
    .toDate()
}

// we need to do this because the value selected by react-datepicker
// uses the local timezone, but we want to interpret it in UTC
export const convertLocalToUTC = (date: Date): Date => {
  const offsetMinutes = moment(date).utcOffset()
  return moment(date)
    .add(offsetMinutes, 'minutes')
    .toDate()
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
    // For three outcomes, where the first outcome is the one being sold, the formula is:
    // f(r) = ((y - R) * (z - R)) * (x  + a - R) - x*y*z
    // where:
    //   `R` is r / (1 - fee)
    //   `x`, `y`, `z` are the market maker holdings for each outcome
    //   `a` is the amount of outcomes that are being sold
    //   `r` (the unknown) is the amount of collateral that will be returned in exchange of `a` tokens
    const R = r.div(1 - fee)
    const firstTerm = otherHoldingsBig.map(h => h.minus(R)).reduce((a, b) => a.mul(b))
    const secondTerm = holdingsBig.plus(sharesToSellBig).minus(R)
    const thirdTerm = otherHoldingsBig.reduce((a, b) => a.mul(b), holdingsBig)
    return firstTerm.mul(secondTerm).minus(thirdTerm)
  }

  const r = newtonRaphson(f, 0, { maxIterations: 100 })

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

/**
 * Compute the number of outcomes that will be sent to the user by the Market Maker
 * after funding it for the first time with `addedFunds` of collateral.
 */
export const calcInitialFundingSendAmounts = (addedFunds: BigNumber, distributionHint: BigNumber[]): BigNumber[] => {
  const maxHint = distributionHint.reduce((a, b) => (a.gt(b) ? a : b))

  const sendAmounts = distributionHint.map(hint => addedFunds.sub(addedFunds.mul(hint).div(maxHint)))

  return sendAmounts
}

/**
 * Compute the number of outcomes that will be sent to the user by the Market Maker
 * after adding `addedFunds` of collateral.
 */
export const calcAddFundingSendAmounts = (
  addedFunds: BigNumber,
  holdingsBN: BigNumber[],
  poolShareSupply: BigNumber,
): Maybe<BigNumber[]> => {
  if (poolShareSupply.eq(0)) {
    return null
  }

  const poolWeight = holdingsBN.reduce((a, b) => (a.gt(b) ? a : b))

  const sendAmounts = holdingsBN.map(h => {
    const remaining = addedFunds.mul(h).div(poolWeight)
    return addedFunds.sub(remaining)
  })

  return sendAmounts
}

/**
 * Compute the number of outcomes that will be sent to the user by the Market Maker
 * after removing `removedFunds` of pool shares.
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
 * Compute the amount of collateral that can be obtained via merging after the user
 * removed `removedFunds` of pool shares.
 *
 * This is 0 when the probabilities are uniform (i.e. all the holdings are equal).
 */
export const calcDepositedTokens = (
  removedFunds: BigNumber,
  holdingsBN: BigNumber[],
  poolShareSupply: BigNumber,
): BigNumber => {
  const sendAmounts = calcRemoveFundingSendAmounts(removedFunds, holdingsBN, poolShareSupply)
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

export function keys<T>(o: T): Array<keyof T> {
  return Object.keys(o) as any
}

export function range(max: number): number[] {
  return Array.from(new Array(max), (_, i) => i)
}

export const getMarketTitles = (templateId: Maybe<number>) => {
  if (templateId === 5 || templateId === 6) {
    return { marketTitle: 'Nuanced Binary Market', marketSubtitle: 'What is a nuanced-binary market?' }
  } else if (templateId === 2) {
    return { marketTitle: 'Categorical Market', marketSubtitle: 'What is a categorical market?' }
  } else {
    return { marketTitle: 'Binary Market', marketSubtitle: 'What is a binary market?' }
  }
}

/**
 * Given a string representing a floating point number,
 * return a floating point number with a fixed amount of decimal places.
 */
export const limitDecimalPlaces = (value: string, decimals: number) => {
  const limitedString: string =
    value.indexOf('.') >= 0
      ? value.substr(0, value.indexOf('.')) + value.substr(value.indexOf('.'), decimals + 1)
      : value
  return Number.parseFloat(limitedString)
}

export const formatNumber = (number: string, decimals = 2): string => {
  if (number.length < 1) {
    return `0${decimals > 0 ? '.' + '0'.repeat(decimals) : ''}`
  }

  const fixedInt = parseFloat(number.split(',').join('')).toFixed(decimals)
  const splitFixedInt = fixedInt.split('.')[0]
  const formattedSubstring = splitFixedInt.replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,')

  return `${formattedSubstring}${decimals > 0 ? '.' + fixedInt.split('.')[1] : ''}`
}

export const formatToShortNumber = (number: string, decimals = 2): string => {
  if (number.length < 1) {
    return '0'
  }

  const units = ['', 'K', 'M', 'B', 'T']
  let unitIndex = 0
  let rNumber = parseFloat(number.split(',').join(''))

  while (rNumber >= 1000 && unitIndex < 5) {
    unitIndex += 1
    rNumber = rNumber / 1000
  }

  return `${parseFloat(rNumber.toFixed(decimals))}${units[unitIndex]}`
}

export const isObjectEqual = (obj1?: any, obj2?: any): boolean => {
  if (!obj1 && obj2) return false
  if (!obj2 && obj1) return false
  if (!obj1 && !obj2) return true
  if (typeof obj1 !== typeof obj2) return false

  if (typeof obj1 !== 'object' && !Array.isArray(obj1)) {
    return obj1 === obj2
  }

  if (Array.isArray(obj1)) {
    for (let index = 0; index < obj1.length; index += 1) {
      if (!isObjectEqual(obj1[index], obj2[index])) return false
    }
    return true
  }

  const keys1 = Object.keys(obj1)
  const keys2 = Object.keys(obj2)

  if (keys1.length !== keys2.length) return false

  for (let keyIndex = 0; keyIndex < keys1.length; keyIndex += 1) {
    const key = keys1[keyIndex]
    if (typeof obj1[key] !== typeof obj2[key]) return false
    if (!isObjectEqual(obj1[key], obj2[key])) return false
  }

  return true
}

export const waitABit = (milli = 1000) =>
  new Promise(resolve => {
    setTimeout(resolve, milli)
  })

export const numberToByte32 = (num: number): string => {
  const hex = new BigNumber(num).toHexString()
  const frontZeros = '0'.repeat(66 - hex.length)

  return `0x${frontZeros}${hex.split('0x')[1]}`
}
