import { Contract, ethers } from 'ethers'
import { BigNumber } from 'ethers/utils'

import { DAI_TO_XDAI_TOKEN_BRIDGE_ADDRESS, DEFAULT_TOKEN_ADDRESS } from '../common/constants'

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
}

export { XdaiService }
