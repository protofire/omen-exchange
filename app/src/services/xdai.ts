import axios from 'axios'
import { Contract, ethers } from 'ethers'
import { BigNumber } from 'ethers/utils'
import gql from 'graphql-tag'

import {
  DAI_TO_XDAI_TOKEN_BRIDGE_ADDRESS,
  DEFAULT_TOKEN_ADDRESS,
  XDAI_FOREIGN_BRIDGE,
  XDAI_HOME_BRIDGE,
  XDAI_TO_DAI_TOKEN_BRIDGE_ADDRESS,
} from '../common/constants'
import { getKlerosCurateGraphUris } from '../util/networks'

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
]

class XdaiService {
  provider: any
  abi: any

  constructor(provider: any) {
    this.provider = provider
    this.abi = abi
  }

  generateErc20ContractInstance = async () => {
    const signer = this.provider.getSigner()
    const account = await signer.getAddress()

    const erc20 = new ERC20Service(this.provider, account, DEFAULT_TOKEN_ADDRESS)

    return erc20.getContract
  }

  generateXdaiBridgeContractInstance = async (ovmAddress: string) => {
    const signer = this.provider.getSigner()
    return new ethers.Contract(ovmAddress, this.abi, signer)
  }
  generateSendTransaction = async (amount: BigNumber, contract: Contract) => {
    try {
      const transaction = await contract.transfer(DAI_TO_XDAI_TOKEN_BRIDGE_ADDRESS, amount)
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
  fetchXdaiTransactionData = async () => {
    try {
      const queryForeign = `
        query GetTransactions($address: String!) {
          executions(orderBy:timestamp,orderDirection:desc,where:{recipient: $address}) {
            transactionHash
            value
          }
        }
        `
      const signer = this.provider.getSigner()
      const account = await signer.getAddress()
      console.log(account)

      const query = `
          query Requests($address: String) {
              requests(orderBy:timestamp,orderDirection:desc,where:{sender: $address}) {
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
      const variables = { address: account }

      console.log('inside')
      const xDaiRequests = await axios.post(XDAI_HOME_BRIDGE, { query, variables })
      const xDaiExecutions = await axios.post(XDAI_FOREIGN_BRIDGE, { query: queryForeign, variables })
      console.log(xDaiRequests)
      const requestsArray = xDaiRequests.data.data.requests
      const executionsArray = xDaiExecutions.data.data.executions
      // console.log(requestsArray, 'jsjsjsjsjsj')
      // console.log(executionsArray, 'rela deal')
      const results = requestsArray.filter(
        ({ transactionHash: id1 }: any) => !executionsArray.some(({ transactionHash: id2 }: any) => id2 === id1),
      )
      return results[0]
    } catch (e) {
      console.log(e)
    }
  }
}

export { XdaiService }
