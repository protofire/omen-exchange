import axios from 'axios'

import {
  CONFIRMATION_COUNT,
  MAIN_NETWORKS,
  RINKEBY_NETWORKS,
  SOKOL_NETWORKS,
  XDAI_NETWORKS,
} from '../../common/constants'
import { networkIds } from '../networks'
import { TransactionStep } from '../types'

import { waitABit } from './base'

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
