import axios from 'axios'

import { CONFIRMATION_COUNT } from '../../common/constants'
import { getGraphUris, networkNames } from '../networks'
import { TransactionStep } from '../types'

import { waitABit } from './other'

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

export const getGraphMeta = async (networkId: number) => {
  const query = `
    query {
      _meta {
        block {
          hash
          number
        }
      }
    }
  `
  const { httpUri } = getGraphUris(networkId)
  const result = await axios.post(httpUri, { query })
  return result.data.data._meta.block
}

export const waitForBlockToSync = async (networkId: number, blockNum: number) => {
  let block
  while (!block || block.number < blockNum + 1) {
    block = await getGraphMeta(networkId)
    await waitABit()
  }
}

export const getBySafeTx = async (networkId: number, safeTxHash: string) => {
  const networkName = (networkNames as any)[networkId].toLowerCase()
  const txServiceUrl = `https://safe-transaction.${networkName}.gnosis.io/api/v1`
  const result = await axios.get(`${txServiceUrl}/transactions/${safeTxHash}`)
  return result.data
}

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
