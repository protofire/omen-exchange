import axios from 'axios'
import Big from 'big.js'

import {
  CONFIRMATION_COUNT,
  MAIN_NETWORKS,
  RINKEBY_NETWORKS,
  SOKOL_NETWORKS,
  XDAI_NETWORKS,
} from '../../common/constants'
import { MarketTokenPair } from '../../hooks/useGraphMarketsFromQuestion'
import { CompoundService } from '../../services'
import { getNativeAsset, getWrapToken, networkIds } from '../networks'
import { BalanceItem, Token, TransactionStep } from '../types'

export const checkRpcStatus = async (customUrl: string, setStatus: any, network: any) => {
  try {
    const response = await axios.post(customUrl, {
      id: +new Date(),
      jsonrpc: '2.0',
      method: 'net_version',
    })
    if (response.data.error || +response.data.result !== network) {
      setStatus(false)
      return false
    }

    setStatus(true)
    return true
  } catch (e) {
    setStatus(false)

    return false
  }
}

export const isValidHttpUrl = (data: string): boolean => {
  let url

  try {
    url = new URL(data)
  } catch (_) {
    return false
  }

  return url.protocol === 'http:' || url.protocol === 'https:'
}
export const getNetworkFromChain = (chain: string) => {
  const network = RINKEBY_NETWORKS.includes(chain)
    ? networkIds.RINKEBY
    : SOKOL_NETWORKS.includes(chain)
    ? networkIds.SOKOL
    : MAIN_NETWORKS.includes(chain)
    ? networkIds.MAINNET
    : XDAI_NETWORKS.includes(chain)
    ? networkIds.XDAI
    : -1
  return network
}

export const waitForConfirmations = async (
  hash: string,
  provider: any,
  setConfirmations: (confirmations: number) => void,
  setTxState: (step: TransactionStep) => void,
  confirmations?: number,
) => {
  setTxState(TransactionStep.transactionSubmitted)
  let receipt
  const requiredConfs = confirmations ? confirmations : CONFIRMATION_COUNT

  while (!receipt || !receipt.confirmations || (receipt.confirmations && receipt.confirmations <= requiredConfs)) {
    receipt = await provider.getTransaction(hash)
    if (receipt && receipt.confirmations) {
      setTxState(TransactionStep.confirming)
      const confs = receipt.confirmations > requiredConfs ? requiredConfs : receipt.confirmations
      setConfirmations(confs)
    }
    await waitABit(2000)
  }
}
export const reverseArray = (array: any[]): any[] => {
  const newArray = array.map((e, i, a) => a[a.length - 1 - i])
  return newArray
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
export function keys<T>(o: T): Array<keyof T> {
  return Object.keys(o) as any
}

export function range(max: number): number[] {
  return Array.from(new Array(max), (_, i) => i)
}
export const delay = (timeout: number) => new Promise(res => setTimeout(res, timeout))

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

export const waitABit = (milli = 1000) =>
  new Promise(resolve => {
    setTimeout(resolve, milli)
  })

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

//this will probably be deleted with compound cleanup
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
