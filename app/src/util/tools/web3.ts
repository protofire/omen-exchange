import Big from 'big.js'
import { BigNumber, getAddress, parseUnits } from 'ethers/utils'

import { getLogger } from '../logger'
import { getContractAddress, getNativeAsset, getWrapToken } from '../networks'
import { Token } from '../types'

import { waitABit } from './other'
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

export const waitUntilContractDeployed = async (provider: any, address: string) => {
  while (!isContract(provider, address)) {
    await waitABit()
  }
}

/**
 *  Gets initial display collateral
 */
export const getInitialCollateral = (networkId: number, collateral: Token, relay = false): Token => {
  if (collateral.address.toLowerCase() === getWrapToken(networkId).address.toLowerCase()) {
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
