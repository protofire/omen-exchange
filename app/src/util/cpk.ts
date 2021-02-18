/* eslint-disable */
// @ts-nocheck
import BigNumber from 'bignumber.js'
import CPK, { OperationType } from 'contract-proxy-kit/lib/esm'
import multiSendAbi from 'contract-proxy-kit/lib/esm/abis/MultiSendAbi.json'
import EthersAdapter from 'contract-proxy-kit/lib/esm/ethLibAdapters/EthersAdapter'
import safeAbi from 'contract-proxy-kit/lib/esm/abis/SafeAbi.json'
import CpkTransactionManager from 'contract-proxy-kit/lib/esm/transactionManagers/CpkTransactionManager'
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
  constructor(opts?: CPKConfig) {
    console.log(opts)
    super(opts)
    this.transactionManager = opts.transactionManager
  }

  async execTransactions(transactions: Transaction[], options?: ExecOptions): Promise<TransactionResult> {
    console.log(this.transactionManager)
    if (!this.address) {
      throw new Error('CPK address uninitialized')
    }
    if (!this.contract) {
      throw new Error('CPK contract uninitialized')
    }
    if (!this.masterCopyAddress) {
      throw new Error('CPK masterCopyAddress uninitialized')
    }
    if (!this.fallbackHandlerAddress) {
      throw new Error('CPK fallbackHandlerAddress uninitialized')
    }
    if (!this.ethLibAdapter) {
      throw new Error('CPK ethLibAdapter uninitialized')
    }
    if (!this.transactionManager) {
      throw new Error('CPK transactionManager uninitialized')
    }

    const ownerAccount = await this.getOwnerAccount()
    if (!ownerAccount) {
      throw new Error('CPK ownerAccount uninitialized')
    }

    const safeExecTxParams = this.getSafeExecTxParams(transactions)
    const sendOptions = { ...options, from: ownerAccount } // normalizeGasLimit({ ...options, from: ownerAccount })

    const codeAtAddress = await this.ethLibAdapter.getCode(this.address)
    const isDeployed = codeAtAddress !== '0x'

    const txManager = this.transactionManager

    const cpkContracts: CPKContracts = {
      safeContract: this.contract,
      proxyFactory: this.proxyFactory,
      masterCopyAddress: this.masterCopyAddress,
      fallbackHandlerAddress: this.fallbackHandlerAddress,
    }

    return txManager.execTransactions({
      ownerAccount,
      safeExecTxParams,
      transactions,
      contracts: cpkContracts,
      ethLibAdapter: this.ethLibAdapter,
      isDeployed,
      isConnectedToSafe: this.isConnectedToSafe,
      sendOptions,
    })
  }

  private getSafeExecTxParams(transactions: Transaction[]): StandardTransaction {
    if (transactions.length === 1) {
      return standardizeTransaction(transactions[0])
    }

    if (!this.multiSend) {
      throw new Error('CPK MultiSend uninitialized')
    }

    return {
      to: this.multiSend.address,
      value: '0',
      data: this.encodeMultiSendCallData(transactions),
      operation: CPK.DelegateCall,
    }
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

const pfABI = [
  {
    constant: false,
    inputs: [
      {
        internalType: 'address',
        name: 'masterCopy',
        type: 'address',
      },
      {
        internalType: 'uint256',
        name: 'saltNonce',
        type: 'uint256',
      },
      {
        internalType: 'address',
        name: 'to',
        type: 'address',
      },
      {
        internalType: 'uint256',
        name: 'value',
        type: 'uint256',
      },
      {
        internalType: 'bytes',
        name: 'data',
        type: 'bytes',
      },
      {
        internalType: 'enum Enum.Operation',
        name: 'operation',
        type: 'uint8',
      },
      {
        internalType: 'address',
        name: 'owner',
        type: 'address',
      },
      {
        internalType: 'bytes',
        name: 'signature',
        type: 'bytes',
      },
    ],
    name: 'createProxyAndExecTransaction',
    outputs: [
      {
        internalType: 'bool',
        name: 'execTransactionSuccess',
        type: 'bool',
      },
    ],
    payable: true,
    stateMutability: 'payable',
    type: 'function',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: 'contract Proxy',
        name: 'proxy',
        type: 'address',
      },
    ],
    name: 'ProxyCreation',
    type: 'event',
  },
  {
    constant: true,
    inputs: [
      {
        internalType: 'address',
        name: 'proxy',
        type: 'address',
      },
      {
        internalType: 'address',
        name: 'to',
        type: 'address',
      },
      {
        internalType: 'uint256',
        name: 'value',
        type: 'uint256',
      },
      {
        internalType: 'bytes',
        name: 'data',
        type: 'bytes',
      },
      {
        internalType: 'enum Enum.Operation',
        name: 'operation',
        type: 'uint8',
      },
      {
        internalType: 'uint256',
        name: 'safeTxGas',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: 'baseGas',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: 'gasPrice',
        type: 'uint256',
      },
      {
        internalType: 'address',
        name: 'gasToken',
        type: 'address',
      },
      {
        internalType: 'address',
        name: 'refundReceiver',
        type: 'address',
      },
      {
        internalType: 'uint256',
        name: '_nonce',
        type: 'uint256',
      },
    ],
    name: 'getTransactionHash',
    outputs: [
      {
        internalType: 'bytes32',
        name: '',
        type: 'bytes32',
      },
    ],
    payable: false,
    stateMutability: 'view',
    type: 'function',
  },
  {
    constant: true,
    inputs: [],
    name: 'proxyCreationCode',
    outputs: [
      {
        internalType: 'bytes',
        name: '',
        type: 'bytes',
      },
    ],
    payable: false,
    stateMutability: 'view',
    type: 'function',
  },
]

const sigABI = [
  {
    constant: true,
    inputs: [
      {
        internalType: 'uint256',
        name: 'inr',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: 'ins',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: 'inv',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: 'pos',
        type: 'uint256',
      },
    ],
    name: 'decode',
    outputs: [
      {
        internalType: 'uint8',
        name: 'v',
        type: 'uint8',
      },
      {
        internalType: 'bytes32',
        name: 'r',
        type: 'bytes32',
      },
      {
        internalType: 'bytes32',
        name: 's',
        type: 'bytes32',
      },
    ],
    payable: false,
    stateMutability: 'view',
    type: 'function',
  },
  {
    constant: true,
    inputs: [
      {
        internalType: 'bytes32',
        name: 'messageHash',
        type: 'bytes32',
      },
      {
        internalType: 'bytes',
        name: 'messageSignature',
        type: 'bytes',
      },
      {
        internalType: 'uint256',
        name: 'pos',
        type: 'uint256',
      },
    ],
    name: 'recoverKey',
    outputs: [
      {
        internalType: 'address',
        name: '',
        type: 'address',
      },
    ],
    payable: false,
    stateMutability: 'view',
    type: 'function',
  },
  {
    constant: true,
    inputs: [
      {
        internalType: 'bytes32',
        name: 'messageHash',
        type: 'bytes32',
      },
      {
        internalType: 'bytes',
        name: 'messageSignature',
        type: 'bytes',
      },
      {
        internalType: 'uint256',
        name: 'pos',
        type: 'uint256',
      },
    ],
    name: 'recoverKey2',
    outputs: [
      {
        internalType: 'address',
        name: '',
        type: 'address',
      },
    ],
    payable: false,
    stateMutability: 'view',
    type: 'function',
  },
  {
    constant: true,
    inputs: [
      {
        internalType: 'bytes32',
        name: 'messageHash',
        type: 'bytes32',
      },
      {
        internalType: 'bytes',
        name: 'messageSignature',
        type: 'bytes',
      },
      {
        internalType: 'uint256',
        name: 'pos',
        type: 'uint256',
      },
    ],
    name: 'recoverKey3',
    outputs: [
      {
        internalType: 'address',
        name: '',
        type: 'address',
      },
    ],
    payable: false,
    stateMutability: 'view',
    type: 'function',
  },
  {
    constant: true,
    inputs: [
      {
        internalType: 'bytes',
        name: 'signatures',
        type: 'bytes',
      },
      {
        internalType: 'uint256',
        name: 'pos',
        type: 'uint256',
      },
    ],
    name: 'signatureSplit',
    outputs: [
      {
        internalType: 'uint8',
        name: 'v',
        type: 'uint8',
      },
      {
        internalType: 'bytes32',
        name: 'r',
        type: 'bytes32',
      },
      {
        internalType: 'bytes32',
        name: 's',
        type: 'bytes32',
      },
    ],
    payable: false,
    stateMutability: 'view',
    type: 'function',
  },
]
export const zeroAddress = `0x${'0'.repeat(40)}`

class RelayTransactionManager {
  get config(): TransactionManagerConfig {
    return {
      name: 'RelayManager',
      url: undefined,
    }
  }

  async execTransactions({
    ownerAccount,
    safeExecTxParams,
    contracts,
    ethLibAdapter,
    isConnectedToSafe,
    isDeployed,
    sendOptions,
  }) {
    console.log(contracts.proxyFactory.address, ethLibAdapter)
    console.log('proxy address: ', contracts.safeContract.address)
    const proxyAddress = contracts.safeContract.address

    console.log({ isDeployed })

    // TODO: get nonce
    const nonce = isDeployed ? 4 : 0

    const tx = {
      to: safeExecTxParams.to,
      value: '0',
      data: safeExecTxParams.data,
      operation: safeExecTxParams.operation,
      safeTxGas: 0,
      dataGas: 0,
      gasPrice: 0,
      gasToken: zeroAddress,
      refundReceiver: zeroAddress,
      nonce,
    }

    const factoryAddress = contracts.proxyFactory.address
    const factory = new ethers.Contract(
      factoryAddress,
      pfABI,
      new ethers.providers.JsonRpcProvider('https://dai.poa.network/'),
    )
    console.log(contracts.safeContract.address)
    const txHash = await factory.getTransactionHash(
      proxyAddress,
      tx.to,
      tx.value,
      tx.data,
      tx.operation,
      tx.safeTxGas,
      tx.dataGas,
      tx.gasPrice,
      tx.gasToken,
      tx.refundReceiver,
      tx.nonce,
    )
    console.log({ txHash })

    const sig = await this.signTransactionHash(ethLibAdapter, txHash)

    // console.log("Before:")
    // console.log({ sig })
    const sigad = '0xaE8f96F5a7eDa6C6366bF9567B841a8c3fd7c6B1'
    const sigs = new ethers.Contract(sigad, sigABI, new ethers.providers.JsonRpcProvider('https://dai.poa.network/'))
    // const l1 = await sigs.recoverKey(txHash, sig, 0)
    // const l2 = await sigs.recoverKey2(txHash, sig, 0)
    const owner = await sigs.recoverKey3(txHash, sig, 0)
    console.log(owner)

    // console.log(l1, l2, l3)
    // const b = await sigs.signatureSplit(sig, 0)
    // console.log(b)
    // return

    // cross chain sig works!

    // keccak256(toUtf8Bytes('Contract Proxy Kit'))
    const predeterminedSaltNonce = '0xcfe33a586323e7325be6aa6ecd8b4600d232a9037e83c8ece69413b777dabe65'

    console.log(tx)
    // const result = await factory.createProxyAndExecTransaction(
    //   contracts.masterCopyAddress,
    //   predeterminedSaltNonce,
    //   tx.to,
    //   tx.value,
    //   tx.data,
    //   tx.operation,
    //   ownerAccount,
    //   sig,
    //   {
    //     value: sendOptions.value,
    //     gasLimit: 1000000
    //   }
    // );
    // console.log(result)
    const gasLimit = '3000000'

    const biconomy = async body => {
      const BICONOMY_API_KEY = 'MPEEl225y.19edc8a0-06f9-444b-b6bc-c1b7ca6bdc31'
      const response = await fetch(`https://api.biconomy.io/api/v2/meta-tx/native`, {
        method: 'POST',
        headers: {
          'x-api-key': BICONOMY_API_KEY,
          'Content-Type': 'application/json;charset=utf-8',
        },
        body: JSON.stringify(body),
      })
      const json = await response.json()
      return json
    }

    const createProxyAndExecTransaction = async () => {
      const METHOD_API_ID = 'ed29e00e-f3d1-4a53-8c2c-92b6597182a5'
      const result = await biconomy({
        to: factoryAddress,
        gasLimit,
        apiId: METHOD_API_ID, // Can be found on dashboard under Manage API section
        params: [
          contracts.masterCopyAddress,
          predeterminedSaltNonce,
          tx.to,
          tx.value,
          tx.data,
          tx.operation,
          ownerAccount,
          sig,
        ],
        from: ownerAccount,
      })
      console.log(result)
    }

    const execTransaction = async () => {
      console.log({ gasLimit })
      const METHOD_API_ID = '78dc94f7-4420-4275-862f-e3ab17c4d38e'
      const result = await biconomy({
        to: proxyAddress,
        gasLimit,
        apiId: METHOD_API_ID, // Can be found on dashboard under Manage API section
        params: [
          tx.to,
          tx.value,
          tx.data,
          tx.operation,
          tx.safeTxGas,
          tx.dataGas,
          tx.gasPrice,
          tx.gasToken,
          tx.refundReceiver,
          sig,
        ],
        from: ownerAccount,
      })
      console.log(result)
    }

    if (isDeployed) {
      await execTransaction()
    } else {
      await createProxyAndExecTransaction()
    }
  }

  private async signTransactionHash(ethLibAdapter: EthLibAdapter, txHash: string) {
    const messageArray = ethers.utils.arrayify(txHash)
    let sig = await ethLibAdapter.signer.signer.signMessage(messageArray)
    let sigV = parseInt(sig.slice(-2), 16)

    switch (sigV) {
      case 0:
      case 1:
        sigV += 31
        break
      case 27:
      case 28:
        sigV += 4
        break
      default:
        throw new Error('Invalid signature')
    }

    sig = sig.slice(0, -2) + sigV.toString(16)
    return sig
  }
}

export const createCPK = async (provider: Web3Provider) => {
  const signer = provider.getSigner()
  const network = await provider.getNetwork()
  const cpkAddresses = getCPKAddresses(network.chainId)
  console.log(network)
  const networks = cpkAddresses
    ? {
        [network.chainId]: cpkAddresses,
      }
    : {}
  console.log({ networks })
  const transactionManager = new RelayTransactionManager()
  // const transactionManager = new CpkTransactionManager()
  const cpk = new OCPK({ ethLibAdapter: new EthersAdapter({ ethers, signer }), transactionManager, networks })
  await cpk.init()
  return cpk
}

export default OCPK
