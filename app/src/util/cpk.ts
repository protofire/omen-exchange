import CPK, { OperationType } from 'contract-proxy-kit/lib/esm'
import multiSendAbi from 'contract-proxy-kit/lib/esm/abis/MultiSendAbi.json'
import EthersAdapter from 'contract-proxy-kit/lib/esm/ethLibAdapters/EthersAdapter'
import CpkTransactionManager from 'contract-proxy-kit/lib/esm/transactionManagers/CpkTransactionManager'
import { getHexDataLength, joinHexData } from 'contract-proxy-kit/lib/esm/utils/hexData'
import { ethers } from 'ethers'
import { Web3Provider } from 'ethers/providers'

import proxyFactoryAbi from '../abi/proxyFactory.json'
import { RelayService } from '../services/relay'
import { SafeService } from '../services/safe'

import {
  getCPKAddresses,
  getInfuraUrl,
  getRelayProxyFactory,
  getTargetSafeImplementation,
  networkIds,
} from './networks'

type Address = string

interface StandardTransaction {
  operation: OperationType
  to: Address
  value: string
  data: string
}

export interface Transaction {
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

// keccak256(toUtf8Bytes('Contract Proxy Kit'))
const predeterminedSaltNonce = '0xcfe33a586323e7325be6aa6ecd8b4600d232a9037e83c8ece69413b777dabe65'

// Omen CPK monkey patch
// // @ts-expect-error ignore
class OCPK extends CPK {
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

class RelayTransactionManager {
  get config() {
    return {
      name: 'RelayTransactionManager',
    }
  }

  // @ts-expect-error ignore
  async execTransactions({ contracts, ethLibAdapter, isDeployed, safeExecTxParams, transactions }) {
    // build params
    const proxyFactoryAddress = contracts.proxyFactory.address
    const proxyAddress = contracts.safeContract.address
    const masterCopyAddress = contracts.masterCopyAddress
    const fallbackHandlerAddress = contracts.fallbackHandlerAddress
    const { data, operation, to } = safeExecTxParams
    const value = '0'
    const safeTxGas = 0
    const dataGas = 0
    const gasPrice = 0
    const gasToken = ethers.constants.AddressZero
    const refundReceiver = ethers.constants.AddressZero
    const from = await ethLibAdapter.signer.signer.getAddress()

    // get safe transaction nonce
    const safe = new SafeService(proxyAddress, ethLibAdapter.signer)
    const nonce = isDeployed ? await safe.getNonce() : 0

    // get safe transaction hash to sign
    const proxyFactory = new ethers.Contract(proxyFactoryAddress, proxyFactoryAbi, ethLibAdapter.signer)
    const txHash = await proxyFactory.getTransactionHash(
      proxyAddress,
      to,
      value,
      data,
      operation,
      safeTxGas,
      dataGas,
      gasPrice,
      gasToken,
      refundReceiver,
      nonce,
    )

    // sign transaction hash
    const signature = await this.signTransactionHash(ethLibAdapter, txHash)

    // execute transaction through relay
    const relay = new RelayService()

    const standardizedTxs = transactions.map(standardizeTransaction)

    // if proxy is already deployed, exec tx directly, otherwise deploy proxy first
    if (isDeployed) {
      return relay.execTransaction({
        data,
        dataGas,
        from,
        gasPrice,
        gasToken,
        operation,
        proxyFactoryAddress,
        proxyAddress,
        refundReceiver,
        safeTxGas,
        signature,
        to,
        transactions: standardizedTxs,
        value,
      })
    } else {
      return relay.createProxyAndExecTransaction({
        data,
        fallbackHandlerAddress,
        from,
        masterCopyAddress,
        operation,
        predeterminedSaltNonce,
        proxyFactoryAddress,
        signature,
        to,
        transactions: standardizedTxs,
        value,
      })
    }
  }

  private async signTransactionHash(ethLibAdapter: any, txHash: string) {
    const messageArray = ethers.utils.arrayify(txHash)

    // https://github.com/WalletConnect/walletconnect-monorepo/issues/347
    let sig
    if (ethLibAdapter.signer.signer?.provider?.provider?.bridge) {
      const address = await ethLibAdapter.signer.signer.getAddress()
      sig = await ethLibAdapter.signer.signer.provider.provider.send({
        method: 'personal_sign',
        params: [messageArray, address.toLowerCase()],
      })
    } else {
      // sign transaction with the real, underlying mainnet signer
      sig = await ethLibAdapter.signer.signer.signMessage(messageArray)
    }

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

export const createCPK = async (provider: Web3Provider, relay: boolean) => {
  const signer = provider.getSigner()
  const network = await provider.getNetwork()
  const cpkAddresses = getCPKAddresses(network.chainId)

  const networks = cpkAddresses
    ? {
        [network.chainId]: { ...cpkAddresses },
      }
    : {}

  // update proxy factory if relay is enabled
  if (relay) {
    const relayProxyFactoryAddress = getRelayProxyFactory(network.chainId)
    if (relayProxyFactoryAddress) {
      networks[network.chainId].proxyFactoryAddress = relayProxyFactoryAddress
    }
  }

  const transactionManager = relay ? new RelayTransactionManager() : new CpkTransactionManager()

  let cpk = new OCPK({ ethLibAdapter: new EthersAdapter({ ethers, signer }), transactionManager, networks })
  await cpk.init()

  // if this is a brand new user, override the masterCopy
  const deployed = await cpk.isProxyDeployed()

  if (!relay && !deployed) {
    networks[network.chainId].masterCopyAddress = getTargetSafeImplementation(network.chainId)
    cpk = new OCPK({ ethLibAdapter: new EthersAdapter({ ethers, signer }), transactionManager, networks })
    await cpk.init()
  }

  return cpk
}

// for calcRelayProxyAddress to be sync we need to hardcode proxy code, this needs to be updated if we deploy a new proxy factory
const proxyCreationCode = `0x608060405234801561001057600080fd5b506040516101e73803806101e78339818101604052602081101561003357600080fd5b8101908080519060200190929190505050600073ffffffffffffffffffffffffffffffffffffffff168173ffffffffffffffffffffffffffffffffffffffff1614156100ca576040517f08c379a00000000000000000000000000000000000000000000000000000000081526004018080602001828103825260248152602001806101c36024913960400191505060405180910390fd5b806000806101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908373ffffffffffffffffffffffffffffffffffffffff1602179055505060aa806101196000396000f3fe608060405273ffffffffffffffffffffffffffffffffffffffff600054167fa619486e0000000000000000000000000000000000000000000000000000000060003514156050578060005260206000f35b3660008037600080366000845af43d6000803e60008114156070573d6000fd5b3d6000f3fea265627a7a72315820cac3d62bfce6ec8b54a3201159f745e39db8fa84029fbcaa233ea75c5ceaac8264736f6c63430005100032496e76616c6964206d617374657220636f707920616464726573732070726f7669646564`

export const calcRelayProxyAddress = (account: string, provider: any): string | undefined => {
  const ethLibAdapter = new EthersAdapter({ ethers, signer: { provider } })
  const relayProxyFactoryAddress = getRelayProxyFactory(networkIds.XDAI)
  const cpkAddresses = getCPKAddresses(networkIds.XDAI)
  if (relayProxyFactoryAddress && cpkAddresses) {
    const saltNonce = predeterminedSaltNonce
    const salt = ethLibAdapter.keccak256(ethLibAdapter.abiEncode(['address', 'uint256'], [account, saltNonce]))
    const initCode = ethLibAdapter.abiEncodePacked(
      { type: 'bytes', value: proxyCreationCode },
      {
        type: 'bytes',
        value: ethLibAdapter.abiEncode(['address'], [cpkAddresses.masterCopyAddress]),
      },
    )
    const proxyAddress = ethLibAdapter.calcCreate2Address(relayProxyFactoryAddress, salt, initCode)
    return proxyAddress
  }
}

export const verifyProxyAddress = async (owner: string, proxyAddress: string, cpk: any) => {
  const proxyFactoryAddress = cpk.proxyFactory.address
  const masterCopyAddress = cpk.masterCopyAddress
  const proxyFactory = new ethers.Contract(proxyFactoryAddress, proxyFactoryAbi, cpk.ethLibAdapter.signer)
  const computedProxyAddress = await proxyFactory.computeProxyAddress(owner, predeterminedSaltNonce, masterCopyAddress)
  if (computedProxyAddress !== proxyAddress) {
    throw new Error(`Proxy address is incorrect, expected ${computedProxyAddress} but got ${proxyAddress}`)
  }
}

export const getRelayProvider = (
  relay: boolean,
  networkId: number,
  library: any,
  account: string | null | undefined,
) => {
  try {
    // provider override if running as relay
    if (relay && networkId === networkIds.MAINNET) {
      const netId = networkIds.XDAI

      const provider = new ethers.providers.JsonRpcProvider(getInfuraUrl(netId)) as any
      const address = account ? calcRelayProxyAddress(account, provider) : ''

      const signer = library.getSigner()
      const fakeSigner = {
        provider,
        getAddress: () => address,
        _ethersType: 'Signer',
        // access the connected signer for relay signatures
        signer: signer,
      }

      provider.signer = fakeSigner
      provider.getSigner = () => fakeSigner
      provider.relay = true
      return {
        address,
        isRelay: true,
        netId,
        provider,
      }
    }
  } catch (e) {
    console.error('Error while getting relay provider: ', e)
  }
  return {
    address: account,
    isRelay: false,
    netId: networkId,
    provider: library,
  }
}
export default OCPK
