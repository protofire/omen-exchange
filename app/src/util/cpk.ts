import SafeAppsSDK from '@gnosis.pm/safe-apps-sdk'
import CPK, { OperationType } from 'contract-proxy-kit/lib/esm'
import multiSendAbi from 'contract-proxy-kit/lib/esm/abis/MultiSendAbi.json'
import EthersAdapter from 'contract-proxy-kit/lib/esm/ethLibAdapters/EthersAdapter'
import { getHexDataLength, joinHexData } from 'contract-proxy-kit/lib/esm/utils/hexData'
import { ethers } from 'ethers'
import { Web3Provider } from 'ethers/providers'

import { getCPKAddresses } from './networks'

type Address = string

interface StandardTransaction {
  operation: OperationType
  to: Address
  value: string
  data: string
}

interface Transaction {
  operation?: OperationType
  to: Address
  value?: string
  data?: string
}

type NumberLike = number | string | bigint | Record<string, any>

interface GasLimitOptions {
  gas?: NumberLike
  gasLimit?: NumberLike
}

interface BaseTxOptions extends GasLimitOptions {
  gasPrice?: NumberLike
}

interface ExecOptions extends BaseTxOptions {
  nonce?: NumberLike
}

interface TransactionResult {
  hash?: string
  safeTxHash?: string
}

const defaultTxOperation = OperationType.Call
const defaultTxValue = '0'
const defaultTxData = '0x'

function standardizeTransaction(tx: Transaction): StandardTransaction {
  return {
    operation: tx.operation ? tx.operation : defaultTxOperation,
    to: tx.to,
    value: tx.value ? tx.value.toString() : defaultTxValue,
    data: tx.data ? tx.data : defaultTxData,
  }
}

// Omen CPK monkey patch
class OCPK extends CPK {
  async sendTransactions(transactions: StandardTransaction[], options?: ExecOptions): Promise<TransactionResult> {
    const sdk = new SafeAppsSDK()
    const txs = transactions.map(standardizeTransaction)
    const params = { safeTxGas: options?.gas as number }
    const data = {
      txs,
      params,
    }
    return await sdk.txs.send(data)
  }

  async execTransactions(transactions: Transaction[], options?: ExecOptions): Promise<TransactionResult> {
    if (this.isSafeApp() && transactions.length >= 1) {
      return this.sendTransactions(transactions.map(standardizeTransaction), options)
    }

    return super.execTransactions(transactions, options)
  }

  encodeMultiSendCallData(transactions: Transaction[]): string {
    if (!this.ethLibAdapter) {
      throw new Error('CPK ethLibAdapter uninitialized')
    }

    const multiSend = this.multiSend || this.ethLibAdapter.getContract(multiSendAbi)
    const standardizedTxs = transactions.map(standardizeTransaction)
    const ethLibAdapter = this.ethLibAdapter
    return multiSend.encode('multiSend', [
      joinHexData(
        standardizedTxs.map(tx =>
          ethLibAdapter.abiEncodePacked(
            { type: 'uint8', value: tx.operation },
            { type: 'address', value: tx.to },
            { type: 'uint256', value: tx.value },
            { type: 'uint256', value: getHexDataLength(tx.data) },
            { type: 'bytes', value: tx.data },
          ),
        ),
      ),
    ])
  }
}

export const createCPK = async (provider: Web3Provider) => {
  const signer = provider.getSigner()
  const network = await provider.getNetwork()
  const cpkAddresses = getCPKAddresses(network.chainId)
  const networks = cpkAddresses
    ? {
        [network.chainId]: cpkAddresses,
      }
    : {}
  const cpk = new OCPK({ ethLibAdapter: new EthersAdapter({ ethers, signer }), networks })
  await cpk.init()
  return cpk
}

export default OCPK
