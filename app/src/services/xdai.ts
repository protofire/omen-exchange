import axios from 'axios'
import { Contract, ethers, utils } from 'ethers'
import { BigNumber } from 'ethers/utils'

import {
  DAI_TO_XDAI_TOKEN_BRIDGE_ADDRESS,
  DEFAULT_TOKEN_ADDRESS,
  GEN_TOKEN_ADDDRESS_TESTING,
  MULTI_CLAIM_ADDRESS,
  OMNI_BRIDGE_MAINNET_ADDRESS,
  XDAI_FOREIGN_BRIDGE,
  XDAI_HOME_BRIDGE,
  XDAI_TO_DAI_TOKEN_BRIDGE_ADDRESS,
} from '../common/constants'
import { getInfuraUrl, networkIds } from '../util/networks'
import { ExchangeCurrency } from '../util/types'

import { ERC20Service } from './erc20'

const abi = [
  {
    constant: false,
    inputs: [
      { name: 'message', type: 'bytes' },
      { name: 'signatures', type: 'bytes' },
    ],
    name: 'executeSignatures',
    outputs: [],
    payable: false,
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    constant: false,
    inputs: [
      { name: '_sender', type: 'address' },
      { name: '_receiver', type: 'address' },
      { name: '_amount', type: 'uint256' },
    ],
    name: 'relayTokens',
    outputs: [],
    payable: false,
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    constant: true,
    inputs: [{ name: '_txHash', type: 'bytes32' }],
    name: 'relayedMessages',
    outputs: [{ name: '', type: 'bool' }],
    payable: false,
    stateMutability: 'view',
    type: 'function',
  },
]
const omni_abi = [
  {
    constant: false,
    inputs: [
      { name: 'token', type: 'address' },
      { name: '_receiver', type: 'address' },
      { name: '_value', type: 'uint256' },
    ],
    name: 'relayTokens',
    outputs: [],
    payable: false,
    stateMutability: 'nonpayable',
    type: 'function',
  },
]
const xdaiBridgeAbi = [
  {
    type: 'function',
    stateMutability: 'payable',
    payable: true,
    outputs: [],
    name: 'relayTokens',
    inputs: [{ type: 'address', name: '_receiver' }],
    constant: false,
  },
]

const multiClaimAbi = [
  {
    inputs: [
      {
        internalType: 'bytes[]',
        name: 'messages',
        type: 'bytes[]',
      },
      {
        internalType: 'bytes[]',
        name: 'signatures',
        type: 'bytes[]',
      },
    ],
    name: 'claim',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
]

class XdaiService {
  provider: any
  abi: any
  omniAbi: any

  constructor(provider: any) {
    this.provider = provider
    this.abi = abi
    this.omniAbi = omni_abi
  }

  generateErc20ContractInstance = async (currency?: ExchangeCurrency) => {
    const signer = this.provider.getSigner()
    const account = await signer.getAddress()

    const erc20 = new ERC20Service(
      this.provider,
      account,
      currency === ExchangeCurrency.Omen ? GEN_TOKEN_ADDDRESS_TESTING : DEFAULT_TOKEN_ADDRESS,
    )

    return erc20.getContract
  }

  generateXdaiBridgeContractInstance = (currency?: ExchangeCurrency) => {
    const signer = this.provider.relay ? this.provider.signer.signer : this.provider.signer
    console.log(currency)
    console.log(currency === ExchangeCurrency.Omen ? OMNI_BRIDGE_MAINNET_ADDRESS : DAI_TO_XDAI_TOKEN_BRIDGE_ADDRESS)
    return new ethers.Contract(
      currency === ExchangeCurrency.Omen ? OMNI_BRIDGE_MAINNET_ADDRESS : DAI_TO_XDAI_TOKEN_BRIDGE_ADDRESS,
      currency === ExchangeCurrency.Omen ? this.omniAbi : this.abi,
      signer,
    )
  }

  generateSendTransaction = async (amount: BigNumber, contract: Contract, currency?: ExchangeCurrency) => {
    try {
      const transaction = await contract.transfer(
        currency === ExchangeCurrency.Omen ? OMNI_BRIDGE_MAINNET_ADDRESS : DAI_TO_XDAI_TOKEN_BRIDGE_ADDRESS,
        amount,
      )
      return transaction
    } catch (e) {
      throw new Error('Failed at generating transaction!')
    }
  }

  sendXdaiToBridge = async (amount: BigNumber) => {
    try {
      const signer = this.provider.getSigner()
      const account = await signer.getAddress()
      const params = [
        {
          from: account,
          to: XDAI_TO_DAI_TOKEN_BRIDGE_ADDRESS,
          value: amount.toHexString(),
        },
      ]
      const transaction = await this.provider.send('eth_sendTransaction', params)

      return transaction
    } catch (e) {
      throw new Error('Failed at generating transaction!')
    }
  }

  claim = async (messages: string[], signatures: string[]) => {
    const multiclaim = new ethers.Contract(MULTI_CLAIM_ADDRESS, multiClaimAbi, this.provider.signer.signer)
    return multiclaim.claim(messages, signatures)
  }

  static encodeRelayTokens = (receiver: string): string => {
    const transferFromInterface = new utils.Interface(xdaiBridgeAbi)
    return transferFromInterface.functions.relayTokens.encode([receiver])
  }

  encodeClaimDaiTokens = (message: string, signatures: string): string => {
    const transferFromInterface = new utils.Interface(abi)
    return transferFromInterface.functions.executeSignatures.encode([message, signatures])
  }

  fetchCrossChainBalance = async (chain: number) => {
    try {
      let userAddress
      if (this.provider.relay && chain === networkIds.MAINNET) {
        userAddress = await this.provider.signer.signer.getAddress()
      } else {
        userAddress = await this.provider.getSigner().getAddress()
      }
      const response = await axios.post(
        getInfuraUrl(chain),
        {
          jsonrpc: '2.0',
          id: +new Date(),
          method: chain === 100 ? 'eth_getBalance' : 'eth_call',
          params: [
            chain === 100
              ? userAddress
              : {
                  data: ERC20Service.encodedBalanceOf(userAddress),
                  to: DEFAULT_TOKEN_ADDRESS,
                },
            'latest',
          ],
        },
        {
          headers: {
            'Content-Type': 'application/json',
          },
        },
      )
      return response.data.result
    } catch (e) {
      throw new Error(`Error while fetching cross chain balance ${e}`)
    }
  }

  fetchXdaiTransactionData = async () => {
    try {
      const query = `
      query Requests($address: String) {
          requests(first:1000,orderBy:timestamp,orderDirection:desc,where:{recipient: $address}) {
              transactionHash
              recipient
              timestamp
              value
              message{
                id
                content
                signatures
              }
          }
      }`

      const queryForeign = `
        query GetTransactions($address: String!) {
          executions(first:1000,orderBy:timestamp,orderDirection:desc,where:{recipient: $address}) {
            transactionHash
            value
          }
        }
        `

      const account = this.provider.relay
        ? await this.provider.signer.signer.getAddress()
        : await this.provider.getSigner().getAddress()

      const variables = { address: account }
      const xDaiRequests = await axios.post(XDAI_HOME_BRIDGE, { query, variables })
      const xDaiExecutions = await axios.post(XDAI_FOREIGN_BRIDGE, {
        query: queryForeign,
        variables,
      })

      const { requests } = xDaiRequests.data.data
      const { executions } = xDaiExecutions.data.data
      let results = requests.filter(
        ({ transactionHash: id1 }: any) => !executions.some(({ transactionHash: id2 }: any) => id2 === id1),
      )

      // double check if txs have been executed
      const bridge = new ethers.Contract(DAI_TO_XDAI_TOKEN_BRIDGE_ADDRESS, this.abi, this.provider.signer.signer)
      const relayed = await Promise.all(
        results.map(async ({ transactionHash }: any) => await bridge.relayedMessages(transactionHash)),
      )
      // filter out executed claims
      results = results.filter((_: any, index: number) => !relayed[index])

      return results
    } catch (e) {
      console.error(e)
    }
  }
}

export { XdaiService }
