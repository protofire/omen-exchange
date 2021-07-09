import axios from 'axios'
import { Contract, ethers, utils } from 'ethers'
import { BigNumber } from 'ethers/utils'

import {
  DAI_TO_XDAI_TOKEN_BRIDGE_ADDRESS,
  DEFAULT_TOKEN_ADDRESS,
  MULTI_CLAIM_ADDRESS,
  OMNI_BRIDGE_MAINNET_ADDRESS,
  OMNI_BRIDGE_VALIDATORS,
  OMNI_CLAIM_ADDRESS,
  OMNI_FOREIGN_BRIDGE,
  OMNI_HOME_BRIDGE,
  XDAI_FOREIGN_BRIDGE,
  XDAI_HOME_BRIDGE,
  XDAI_TO_DAI_TOKEN_BRIDGE_ADDRESS,
} from '../common/constants'
import { getInfuraUrl, knownTokens, networkIds } from '../util/networks'
import { waitABit } from '../util/tools'

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

const omniBridgeAbi = [
  {
    type: 'function',
    stateMutability: 'view',
    payable: false,
    outputs: [{ type: 'bool', name: '' }],
    name: 'messageCallStatus',
    inputs: [{ type: 'bytes32', name: '_messageId' }],
    constant: true,
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
      { internalType: 'address[]', name: 'bridges', type: 'address[]' },
      { internalType: 'bytes[]', name: 'messages', type: 'bytes[]' },
      { internalType: 'bytes[]', name: 'signatures', type: 'bytes[]' },
    ],
    name: 'claim',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
]
const omenAbi = [
  {
    type: 'function',
    stateMutability: 'nonpayable',
    payable: false,
    outputs: [{ type: 'bool', name: '' }],
    name: 'transferAndCall',
    inputs: [
      { type: 'address', name: '_to' },
      { type: 'uint256', name: '_value' },
      { type: 'bytes', name: '_data' },
    ],
    constant: false,
  },
]
const approveAbi = [
  {
    type: 'function',
    stateMutability: 'nonpayable',
    payable: false,
    outputs: [{ type: 'bool', name: '' }],
    name: 'approve',
    inputs: [
      { type: 'address', name: '_spender' },
      { type: 'uint256', name: '_value' },
    ],
    constant: false,
  },
]

class XdaiService {
  provider: any
  abi: any
  omniAbi: any

  constructor(provider: any) {
    this.provider = provider
    this.abi = abi
  }

  generateErc20ContractInstance = async (address: string) => {
    const signer = this.provider.getSigner()
    const account = await signer.getAddress()

    const erc20 = new ERC20Service(this.provider, account, address ? address : DAI_TO_XDAI_TOKEN_BRIDGE_ADDRESS)

    return erc20.getContract
  }

  generateXdaiBridgeContractInstance = (symbol?: string) => {
    const signer = this.provider.relay ? this.provider.signer.signer : this.provider.signer

    return new ethers.Contract(
      symbol === 'DAI' ? DAI_TO_XDAI_TOKEN_BRIDGE_ADDRESS : OMNI_BRIDGE_MAINNET_ADDRESS,
      this.abi,
      signer,
    )
  }

  generateSendTransaction = async (amount: BigNumber, contract: Contract, symbol?: string) => {
    try {
      const transaction = await contract.transfer(
        symbol === 'DAI' ? DAI_TO_XDAI_TOKEN_BRIDGE_ADDRESS : OMNI_BRIDGE_MAINNET_ADDRESS,
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

  claim = async (addresses: string[], messages: string[], signatures: string[]) => {
    const multiclaim = new ethers.Contract(MULTI_CLAIM_ADDRESS, multiClaimAbi, this.provider.signer.signer)

    return multiclaim.claim(addresses, messages, signatures)
  }

  static encodeRelayTokens = (receiver: string): string => {
    const transferFromInterface = new utils.Interface(xdaiBridgeAbi)
    return transferFromInterface.functions.relayTokens.encode([receiver])
  }
  static encodeApprove = (address: any, value: any) => {
    const transferFromInterface = new utils.Interface(approveAbi)
    return transferFromInterface.functions.approve.encode([address, value])
  }
  static encodeTokenBridgeTransfer = (receiver: string, amount: BigNumber, data: any) => {
    const transferFromInterface = new utils.Interface(omenAbi)
    return transferFromInterface.functions.transferAndCall.encode([receiver, amount, data])
  }

  static waitForBridgeMessageStatus = async (hash: string, provider: any) => {
    let status
    while (!status) {
      // get tx receipt from mainnet
      const transaction = await provider.signer.signer.provider.getTransactionReceipt(hash)
      if (transaction) {
        // get messageId from transaction logs
        const log = transaction.logs[transaction.logs.length - 1]
        const messageId = log.topics[log.topics.length - 1]
        // check if the message has been processed
        const xdaiOmni = new ethers.Contract(OMNI_BRIDGE_VALIDATORS, omniBridgeAbi, provider.signer)
        status = await xdaiOmni.messageCallStatus(messageId)
      }
      await waitABit()
    }
  }

  static waitForClaimSignature = async (hash: string, provider: any) => {
    const transaction = await provider.getTransactionReceipt(hash)
    const log = transaction.logs[transaction.logs.length - 2]
    const messageId = log.topics[log.topics.length - 1]
    const variables = { messageId }
    const query = `
      query Messages($messageId: String) {
        messages(where: { msgId: $messageId }) {
          signatures
        }
      }`

    let signatures
    while (!signatures) {
      const response = await axios.post(OMNI_HOME_BRIDGE, { query, variables })
      const messages = response.data.data.messages
      if (messages.length) {
        const message = messages[0]
        if (message.signatures && message.signatures.length) {
          signatures = message.signatures
        }
      }
      await waitABit()
    }
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

      results = results.map((item: any) => {
        return {
          address: DAI_TO_XDAI_TOKEN_BRIDGE_ADDRESS,
          ...item,
        }
      })

      return results
    } catch (e) {
      console.error(e)
    }
  }
  fetchOmniTransactionData = async (token: KnownToken) => {
    try {
      const { addresses } = knownTokens[token]
      const mainnetAddress = addresses[1]
      const xDaiAddress = addresses[100]

      const query = `
        query getRequests($address: String,$token:String) {
         userRequests(first:1000,where:{user: $address,token:$token}) {
            id
            recipient
            timestamp
            amount
            txHash
            messageId
            encodedData
            message {
              msgId
              msgData
              signatures
              txHash
            }
          }
        }`

      const queryForeign = `
        query GetTransactions($address: String!,$token:String) {
          executions(first:1000,where:{user: $address,token:$token}) {
            id
            messageId
          }
        }
        `

      const relayerOrMainnetAccount = this.provider.relay
        ? await this.provider.signer.signer.getAddress()
        : await this.provider.getSigner().getAddress()
      const mainnetAccount = await this.provider.getSigner().getAddress()

      const requestsVariables = { address: mainnetAccount, token: xDaiAddress }
      const executionsVariables = { address: relayerOrMainnetAccount, token: mainnetAddress }
      const xDaiRequests = await axios.post(OMNI_HOME_BRIDGE, { query, variables: requestsVariables })

      const xDaiExecutions = await axios.post(OMNI_FOREIGN_BRIDGE, {
        query: queryForeign,
        variables: executionsVariables,
      })

      const { userRequests } = xDaiRequests.data.data
      const { executions } = xDaiExecutions.data.data

      let results = userRequests.filter(
        ({ messageId: id1 }: any) => !executions.some(({ messageId: id2 }: any) => id2 === id1),
      )

      // double check if txs have been executed
      const bridge = new ethers.Contract(OMNI_CLAIM_ADDRESS, omniBridgeAbi, this.provider.signer.signer)
      const executed = await Promise.all(
        results.map(async ({ messageId }: any) => await bridge.messageCallStatus(messageId)),
      )
      // filter out executed claims
      results = results.filter((_: any, index: number) => !executed[index])

      results = results.map((item: any) => {
        return {
          address: OMNI_CLAIM_ADDRESS,
          value: item.amount,
          message: {
            signatures: item.message.signatures,
            content: item.message.msgData,
          },
        }
      })

      return results
    } catch (e) {
      console.error(e)
    }
  }
}

export { XdaiService }
