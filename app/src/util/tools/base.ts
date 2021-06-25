import Big from 'big.js'
import { BigNumber, parseUnits } from 'ethers/utils'

import { STANDARD_DECIMALS } from '../../common/constants'
import { MarketTokenPair } from '../../hooks/useGraphMarketsFromQuestion'
import { CompoundService } from '../../services/compound_service'
import { getContractAddress, getNativeAsset, getWrapToken } from '../networks'
import { BalanceItem, Token } from '../types'

import { calcAddFundingSendAmounts, calcRemoveFundingSendAmounts, divBN, formatBigNumber, mulBN } from './'

// use floor as rounding method
Big.RM = 0

//no use not found
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

export const delay = (timeout: number) => new Promise(res => setTimeout(res, timeout))

export const getIndexSets = (outcomesCount: number) => {
  const range = (length: number) => [...Array(length)].map((x, i) => i)
  return range(outcomesCount).map(x => 1 << x)
}

export const getSharesInBaseToken = (
  balances: BalanceItem[],
  compoundService: CompoundService,
  displayCollateral: Token,
): BalanceItem[] => {
  const displayBalances = balances.map(function(bal) {
    if (bal.shares) {
      const baseTokenShares = compoundService.calculateCTokenToBaseExchange(displayCollateral, bal.shares)
      const newBalanceObject = Object.assign({}, bal, {
        shares: baseTokenShares,
      })
      delete newBalanceObject.currentDisplayPrice
      return newBalanceObject
    } else {
      return bal
    }
  })
  return displayBalances
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
  } else if (templateId === 1) {
    return { marketTitle: 'Scalar Market', marketSubtitle: 'What is a scalar market?' }
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

export const calculateSharesBought = (
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

export const isObjectEqual = (obj1?: any, obj2?: any): boolean => {
  if (!obj1 && obj2) return false
  if (!obj2 && obj1) return false
  if (!obj1 && !obj2) return true
  if (typeof obj1 !== typeof obj2) return false

  if (typeof obj1 !== 'object' && !Array.isArray(obj1)) {
    return obj1 === obj2
  }

  if (Array.isArray(obj1)) {
    if (obj1.length !== obj2.length) return false
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

export const clampBigNumber = (x: BigNumber, min: BigNumber, max: BigNumber): BigNumber => {
  if (x.lt(min)) return min
  if (x.gt(max)) return max
  return x
}

export const isDust = (amount: BigNumber, decimals: number): boolean => {
  return amount.lt(parseUnits('0.00001', decimals))
}

export const isScalarMarket = (oracle: string, networkId: number): boolean => {
  const realitioScalarAdapter = getContractAddress(networkId, 'realitioScalarAdapter')

  let isScalar = false
  if (oracle === realitioScalarAdapter.toLowerCase()) {
    isScalar = true
  }

  return isScalar
}

export const getMarketRelatedQuestionFilter = (
  marketsRelatedQuestion: MarketTokenPair[],
  networkId: number,
): string[] => {
  const nativeAssetAddress = getNativeAsset(networkId).address.toLowerCase()
  const wrapTokenAddress = getWrapToken(networkId).address.toLowerCase()
  return marketsRelatedQuestion.map(({ collateralToken }) =>
    collateralToken.toLowerCase() === wrapTokenAddress ? nativeAssetAddress : collateralToken,
  )
}

export const onChangeMarketCurrency = (
  marketsRelatedQuestion: MarketTokenPair[],
  currency: Token | null,
  collateral: Token,
  networkId: number,
  // @ts-expect-error ignore
  history,
) => {
  if (currency) {
    const nativeAssetAddress = getNativeAsset(networkId).address.toLowerCase()
    const wrapTokenAddress = getWrapToken(networkId).address.toLowerCase()
    const selectedMarket = marketsRelatedQuestion.find(element => {
      const collateralToken =
        element.collateralToken.toLowerCase() === wrapTokenAddress ? nativeAssetAddress : element.collateralToken
      return collateralToken.toLowerCase() === currency.address.toLowerCase()
    })
    if (selectedMarket && selectedMarket.collateralToken.toLowerCase() !== collateral.address.toLowerCase()) {
      history.replace(`/${selectedMarket.id}`)
    }
  }
}

export const calcXValue = (currentPrediction: BigNumber, lowerBound: BigNumber, upperBound: BigNumber) => {
  const currentPredictionNumber = Number(formatBigNumber(currentPrediction, STANDARD_DECIMALS))
  const lowerBoundNumber = Number(formatBigNumber(lowerBound, STANDARD_DECIMALS))
  const upperBoundNumber = Number(formatBigNumber(upperBound, STANDARD_DECIMALS))
  const xValue = ((currentPredictionNumber - lowerBoundNumber) / (upperBoundNumber - lowerBoundNumber)) * 100
  return xValue > 100 ? 100 : xValue < 0 ? 0 : xValue
}

export const calcPrediction = (probability: string, lowerBound: BigNumber, upperBound: BigNumber) => {
  const probabilityNumber = Number(probability)
  const lowerBoundNumber = Number(formatBigNumber(lowerBound, STANDARD_DECIMALS, STANDARD_DECIMALS))
  const upperBoundNumber = Number(formatBigNumber(upperBound, STANDARD_DECIMALS, STANDARD_DECIMALS))
  const prediction = probabilityNumber * (upperBoundNumber - lowerBoundNumber) + lowerBoundNumber
  return prediction
}

export const bigMax = (array: Big[]) => {
  let len = array.length
  let maxValue = new Big(0)
  while (len--) {
    if (array[len].gt(maxValue)) {
      maxValue = array[len]
    }
  }
  return maxValue
}
