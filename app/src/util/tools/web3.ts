import Big from 'big.js'
import { BigNumber, getAddress, parseUnits } from 'ethers/utils'

import { getLogger } from '../logger'
import { getContractAddress, getNativeAsset, getToken, getWrapToken } from '../networks'
import { CompoundEnabledTokenType, CompoundTokenType, Token } from '../types'

import { strip0x } from './string_manipulation'
const logger = getLogger('Tools')

export const packSignatures = (array: any) => {
  const length = array.length.toString()

  const msgLength = length.length === 1 ? `0${length}` : length
  let v = ''
  let r = ''
  let s = ''
  array.forEach((e: any) => {
    v = v.concat(e.v)
    r = r.concat(e.r)
    s = s.concat(e.s)
  })
  return `0x${msgLength}${v}${r}${s}`
}
export const signatureToVRS = (rawSignature: string) => {
  const signature = strip0x(rawSignature)
  const v = signature.substr(64 * 2)
  const r = signature.substr(0, 32 * 2)
  const s = signature.substr(32 * 2, 32 * 2)
  return { v, r, s }
}
export const signaturesFormatted = (signatures: string[]) => {
  return packSignatures(signatures.map(s => signatureToVRS(s)))
}
export const isContract = async (provider: any, address: string): Promise<boolean> => {
  const code = await provider.getCode(address)
  return code && code !== '0x'
}
/**
 * Gets the corresponding cToken for a given token symbol.
 * Empty string if corresponding cToken doesn't exist
 */
export const getCTokenForToken = (token: string): string => {
  const tokenSymbol = token.toLowerCase()
  if (tokenSymbol in CompoundEnabledTokenType) {
    return `c${tokenSymbol}`
  } else {
    return ''
  }
}

export const isCToken = (symbol: string): boolean => {
  const tokenSymbol = symbol.toLowerCase()
  if (tokenSymbol in CompoundTokenType) {
    return true
  }
  return false
}

/**
 * Gets base token symbol for a given ctoken
 */
export const getBaseTokenForCToken = (token: string): string => {
  const tokenSymbol = token.toLowerCase()
  if (tokenSymbol.startsWith('c')) {
    return tokenSymbol.substring(1, tokenSymbol.length)
  }
  return ''
}

export const getBaseToken = (networkId: number, symbol: string): Token => {
  const baseTokenSymbol = getBaseTokenForCToken(symbol)
  if (baseTokenSymbol === 'eth') {
    return getNativeAsset(networkId)
  }
  return getToken(networkId, baseTokenSymbol as KnownToken)
}
/**
 *  Gets initial display collateral
 */
export const getInitialCollateral = (networkId: number, collateral: Token, relay = false): Token => {
  if (collateral.address === getWrapToken(networkId).address) {
    return getNativeAsset(networkId, relay)
  } else {
    return collateral
  }
}
export const bigMin = (array: Big[]) => {
  let len = array.length
  let minValue
  while (len--) {
    if (!minValue || array[len].lt(minValue)) {
      minValue = array[len]
    }
  }
  return minValue
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
export const isScalarMarket = (oracle: string, networkId: number): boolean => {
  const realitioScalarAdapter = getContractAddress(networkId, 'realitioScalarAdapter')

  let isScalar = false
  if (oracle === realitioScalarAdapter.toLowerCase()) {
    isScalar = true
  }

  return isScalar
}
export const isDust = (amount: BigNumber, decimals: number): boolean => {
  return amount.lt(parseUnits('0.00001', decimals))
}
export const clampBigNumber = (x: BigNumber, min: BigNumber, max: BigNumber): BigNumber => {
  if (x.lt(min)) return min
  if (x.gt(max)) return max
  return x
}

export const getIndexSets = (outcomesCount: number) => {
  const range = (length: number) => [...Array(length)].map((x, i) => i)
  return range(outcomesCount).map(x => 1 << x)
}
