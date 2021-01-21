import axios from 'axios'
import { Contract } from 'ethers'
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

class XdaiService {
  provider: any

  constructor(provider: any) {
    this.provider = provider
  }

  generateContractInstance = async () => {
    const signer = this.provider.getSigner()
    const account = await signer.getAddress()

    const erc20 = new ERC20Service(this.provider, account, DEFAULT_TOKEN_ADDRESS)

    return erc20.getContract
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
        executions(where:{sender: $address}) {
          transactionHash
          value
        }
      }
      `
      const signer = this.provider.getSigner()
      const account = await signer.getAddress()
      console.log(account)
      const header = {
        'Access-Control-Allow-Origin': '*',
      }

      const query = `
        query Requests($address: String) { 
            requests(where:{sender: $address}) {
                transactionHash
                value
            }
        }`
      const variables = { address: account }

      console.log('inside')
      const xDaiRequests = await axios.post(XDAI_HOME_BRIDGE, { query, variables }, { headers: header })
      const xDaiExecutions = await axios.post(
        XDAI_FOREIGN_BRIDGE,
        { queryForeign, variables },
        {
          headers: header,
        },
      )
      console.log(xDaiRequests, 'jsjsjsjsjsj')
      console.log(xDaiExecutions, 'rela deal')
      return xDaiRequests
    } catch (e) {
      console.log(e)
    }
  }
}

export { XdaiService }
